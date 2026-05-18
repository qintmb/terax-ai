use serde::Serialize;
use std::fs;
use std::path::{Path, PathBuf};

const MAX_DESCRIPTION_BYTES: usize = 512;
const MAX_SKILL_BYTES: usize = 32 * 1024;

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct UniversalSkillMeta {
    pub id: String,
    pub name: String,
    pub path: String,
    pub source: String,
    pub description: String,
}

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct UniversalSkillContent {
    pub id: String,
    pub name: String,
    pub path: String,
    pub source: String,
    pub description: String,
    pub content: String,
}

#[tauri::command]
pub fn universal_skills_list() -> Result<Vec<UniversalSkillMeta>, String> {
    let mut out = Vec::new();
    for root in roots() {
        scan_root(&root, &mut out);
    }
    out.sort_by(|a, b| a.name.to_lowercase().cmp(&b.name.to_lowercase()));
    Ok(out)
}

#[tauri::command]
pub fn universal_skills_read(ids: Vec<String>) -> Result<Vec<UniversalSkillContent>, String> {
    let wanted: std::collections::HashSet<String> = ids.into_iter().collect();
    let mut out = Vec::new();
    for root in roots() {
        read_root(&root, &wanted, &mut out);
    }
    out.sort_by(|a, b| a.name.to_lowercase().cmp(&b.name.to_lowercase()));
    Ok(out)
}

fn roots() -> Vec<PathBuf> {
    let mut out = Vec::new();
    if let Some(home) = dirs::home_dir() {
        out.push(home.join(".agents/skills"));
        out.push(home.join(".codex/skills"));
    }
    out
}

fn scan_root(root: &Path, out: &mut Vec<UniversalSkillMeta>) {
    let Ok(read_dir) = fs::read_dir(root) else {
        return;
    };
    for entry in read_dir.flatten() {
        let path = entry.path();
        if !path.is_dir() {
            continue;
        }
        let skill_file = path.join("SKILL.md");
        if !skill_file.is_file() {
            continue;
        }
        let id = path
            .file_name()
            .and_then(|x| x.to_str())
            .unwrap_or("unknown")
            .to_string();
        let content = fs::read_to_string(&skill_file).unwrap_or_default();
        out.push(UniversalSkillMeta {
            name: id.clone(),
            id,
            path: skill_file.to_string_lossy().to_string(),
            source: root.to_string_lossy().to_string(),
            description: summarize(&content),
        });
    }
}

fn read_root(
    root: &Path,
    wanted: &std::collections::HashSet<String>,
    out: &mut Vec<UniversalSkillContent>,
) {
    let Ok(read_dir) = fs::read_dir(root) else {
        return;
    };
    for entry in read_dir.flatten() {
        let path = entry.path();
        if !path.is_dir() {
            continue;
        }
        let id = path
            .file_name()
            .and_then(|x| x.to_str())
            .unwrap_or("unknown")
            .to_string();
        if !wanted.contains(&id) {
            continue;
        }
        let skill_file = path.join("SKILL.md");
        if !skill_file.is_file() {
            continue;
        }
        let mut content = fs::read_to_string(&skill_file).unwrap_or_default();
        if content.len() > MAX_SKILL_BYTES {
            content.truncate(MAX_SKILL_BYTES);
        }
        out.push(UniversalSkillContent {
            name: id.clone(),
            id,
            path: skill_file.to_string_lossy().to_string(),
            source: root.to_string_lossy().to_string(),
            description: summarize(&content),
            content,
        });
    }
}

fn summarize(content: &str) -> String {
    for line in content.lines() {
        let trimmed = line.trim();
        if trimmed.is_empty() || trimmed.starts_with('#') {
            continue;
        }
        let mut out = trimmed.to_string();
        if out.len() > MAX_DESCRIPTION_BYTES {
            out.truncate(MAX_DESCRIPTION_BYTES);
        }
        return out;
    }
    "Universal skill".to_string()
}

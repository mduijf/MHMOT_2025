use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct GitHubRelease {
    pub tag_name: String,
    pub name: String,
    pub html_url: String,
    pub published_at: String,
    pub body: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateInfo {
    pub available: bool,
    pub current_version: String,
    pub latest_version: String,
    pub download_url: String,
    pub release_notes: String,
}

const GITHUB_API_URL: &str = "https://api.github.com/repos/mduijf/MHMOT_2025/releases/latest";
const CURRENT_VERSION: &str = env!("CARGO_PKG_VERSION");

pub async fn check_for_updates() -> Result<UpdateInfo, String> {
    // Haal de latest release op van GitHub
    let client = reqwest::Client::builder()
        .user_agent("MHMOT-Update-Checker")
        .build()
        .map_err(|e| format!("Failed to create HTTP client: {}", e))?;

    let response = client
        .get(GITHUB_API_URL)
        .send()
        .await
        .map_err(|e| format!("Failed to fetch releases: {}", e))?;

    if !response.status().is_success() {
        return Err(format!("GitHub API returned status: {}", response.status()));
    }

    let release: GitHubRelease = response
        .json()
        .await
        .map_err(|e| format!("Failed to parse release data: {}", e))?;

    // Vergelijk versies (simpele string vergelijking, kan verfijnd worden)
    let latest_version = release.tag_name.trim_start_matches('v');
    let current_version = CURRENT_VERSION;

    let available = is_newer_version(current_version, latest_version);

    Ok(UpdateInfo {
        available,
        current_version: current_version.to_string(),
        latest_version: latest_version.to_string(),
        download_url: release.html_url,
        release_notes: release.body.unwrap_or_else(|| "Geen release notes beschikbaar.".to_string()),
    })
}

/// Simpele versie vergelijking (semantic versioning)
/// Verwacht format: "1.0.0" vs "1.0.1"
fn is_newer_version(current: &str, latest: &str) -> bool {
    let current_parts: Vec<u32> = current
        .split('.')
        .filter_map(|s| s.parse().ok())
        .collect();
    
    let latest_parts: Vec<u32> = latest
        .split('.')
        .filter_map(|s| s.parse().ok())
        .collect();

    // Vergelijk major, minor, patch
    for i in 0..3 {
        let curr = current_parts.get(i).unwrap_or(&0);
        let lat = latest_parts.get(i).unwrap_or(&0);
        
        if lat > curr {
            return true;
        } else if lat < curr {
            return false;
        }
    }
    
    false // Versies zijn gelijk
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_version_comparison() {
        assert!(is_newer_version("1.0.0", "1.0.1"));
        assert!(is_newer_version("1.0.0", "1.1.0"));
        assert!(is_newer_version("1.0.0", "2.0.0"));
        assert!(!is_newer_version("1.0.1", "1.0.0"));
        assert!(!is_newer_version("1.0.0", "1.0.0"));
        assert!(!is_newer_version("2.0.0", "1.9.9"));
    }
}


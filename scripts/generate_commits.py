import os
import subprocess

def run_git(args):
    result = subprocess.run(["git"] + args, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"Git error: {result.stderr}")
    return result.returncode == 0

def get_changes():
    # Get porcelain status
    result = subprocess.run(["git", "status", "--porcelain"], capture_output=True, text=True)
    lines = result.stdout.strip().split("\n")
    changes = []
    for line in lines:
        if not line: continue
        # Status is first two chars
        status = line[:2].strip()
        # Path starts from char 3, might be quoted
        path = line[3:].strip().strip('"')
        changes.append((status, path))
    return changes

def main():
    changes = get_changes()
    commit_count = 0
    target_commits = 58

    print(f"Found {len(changes)} initial changes.")

    # 1. Commit actual changes one by one
    for status, path in changes:
        if commit_count >= target_commits:
            break
        
        # skip gitignore for now or commit it first
        
        # Add the specific change
        if status == "D":
            run_git(["rm", "--cached", path]) # use cached to avoid double delete errors
        else:
            run_git(["add", path])
        
        # Commit
        msg = f"Update {os.path.basename(path)}" if status != "D" else f"Remove {os.path.basename(path)}"
        if run_git(["commit", "-m", msg]):
            commit_count += 1
            print(f"[{commit_count}/{target_commits}] Committed: {path}")

    # 2. Fill the gap with log updates
    log_file = "MAINTENANCE.log"
    while commit_count < target_commits:
        with open(log_file, "a") as f:
            f.write(f"Commit pad #{commit_count + 1} for contribution tracking\n")
        
        run_git(["add", log_file])
        if run_git(["commit", "-m", f"Log update phase {commit_count + 1}"]):
            commit_count += 1
            print(f"[{commit_count}/{target_commits}] Committed: {log_file} (Padding)")

    print(f"\nSuccessfully made {commit_count} commits.")
    print("Run 'git push' to sync to GitHub.")

if __name__ == "__main__":
    main()

#!/bin/bash

# repo path
REPO_PATH="/home/X/h9-saas"
HOME=/root

pull_and_compile() {
  current_date=$(date)
  echo "Compiling at $current_date"
  echo "Pulling latest changes from Git..."
  cd "$REPO_PATH"
  git pull

  echo "Compiling the orch UI code..."
  cd orch/orch-ui

  if [ -d "build" ]; then
    echo "Deleting build..."
    rm -rf "build"
    echo "Folder build deleted."
  else
    echo "Folder build does not exist."
  fi

  
  # Check if any file in folder A has been modified, deleted, or created
  if git diff --quiet HEAD^ -- "orch/orch-ui" >/dev/null 2>&1; then
    echo "Folder A is unchanged."
  else
    echo "Folder A has files that have been modified, deleted, or created."

    # Run the build process with 'make compile'  
    # Additional actions after the build, if needed
  fi
  
  make compile
  echo "Compilation done..."
  current_date=$(date)

  echo "Complete at $current_date"
  echo "\n ************************************************** \n"
}


pull_and_compile

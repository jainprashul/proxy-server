#!/bin/bash

# repo path
REPO_PATH="/home/X/h9-saas"
HOME=/root

# -f: force the compilation to run
FORCE=$1

pull_and_compile() {
  current_date=$(date)
  echo "Compiling at $current_date"
  echo "Pulling latest changes from Git..."
  cd "$REPO_PATH"
  git pull

  echo "Check the diff for orch UI code..."
  cd orch/orch-ui

  # Check if any file in folder A has been modified, deleted, or created
  if git diff --quiet HEAD^ -- "orch/orch-ui" "common/ui" >/dev/null 2>&1; then
    echo "UI folder is unchanged."

    # IF -F flag is passed, force the build process
    if [ "$FORCE" = "-f" ] || [ "$FORCE" = "-F" ]; then
      echo "Force build flag detected. Running the build process..."
      compile
      exit 0
    fi

    # confirm if user wants to continue with the build
    # wait for user input for 5 seconds and continue if no input is received 
    read -t 5 -p "Do you want to continue with the build? (y/n) " || true
    if [ "$REPLY" = "y" ]; then
      compile
    else
      echo "Exiting the build process..."
      exit 0
    fi

  else
    echo "UI folder has files that have been modified, deleted, or created."
    compile
  fi
}

compile(){

  if [ -d "build" ]; then
    echo "Deleting old build..."
    rm -rf "build"
    echo "Folder build deleted."
  else
    echo "Folder build does not exist."
  fi

  echo "Running the build process..."
 # Run the build process with 'make compile'  
  make compile
  echo "Compilation done..."
  current_date=$(date)
  echo "Complete at $current_date"
  echo "\n ************************************************** \n"
  # Additional actions after the build, if needed
}

# Run the function
pull_and_compile

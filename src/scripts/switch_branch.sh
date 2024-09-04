#!/bin/bash

# repo path
REPO_PATH="/home/X/h9-saas"
HOME=/root

# BRANCH: the branch to switch to
BRANCH=$1

switch_branch() {
  current_date=$(date)
  echo "Switching branch at $current_date"
  echo "Pulling latest changes from Git..."
  cd "$REPO_PATH"
  git pull

  echo "Switching to branch $BRANCH..."
  git checkout -f $BRANCH

}


# Run the function
switch_branch
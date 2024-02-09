# !/bin/bash

# root_pid: The PID passed to the script
# That is the PID of the process whose child processes we want to find
root_pid=$1

# all_children: Array that shall store the child processes
declare -A all_children
all_children=()

# Recursive function to find the child processes 
iterate_children()
{
   local pid=$1
   local tids=$(ls /proc/$pid/task)
   # Iterate over all [tid]s in /proc/$pid/task directory
   for tid in $tids
   do
      if [ -e /proc/$pid/task/$tid/children ]
      then
         # Get the child processes in /proc/$pid/task/$tid/children
         local children=$(cat /proc/$pid/task/$tid/children)
         # Iterate over all child processes
         for p in $children
         do
            # Add the found child process to all_children array 
            all_children[${#all_children[@]}]=$p
            # Find the child processes of process $p
            iterate_children $p
         done
      fi
   done
}

iterate_children $root_pid
echo "All child processes of process with PID $root_pid:"
echo ${all_children[*]}

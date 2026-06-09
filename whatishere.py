import os
import io

def print_guide():
    print("=" * 70)
    print("                    WHAT IS HERE - USER GUIDE")
    print("=" * 70)
    print("This tool generates a readable directory tree of any folder,")
    print("showing subdirectories and file sizes.")
    print("\nHow to use:")
    print("1. Enter target directory: Folder you want to scan.")
    print("2. Enter ignores: Items to skip (comma-separated).")
    print("3. Enter output file: Where to save the result, or 'here' to print on screen.")
    print("\nIgnore Input Examples:")
    print("  - default, \"secret.txt\", \"temp\"  <- Default list + custom items")
    print("  - none                           <- Don't ignore anything")
    print("  - \"node_modules\", \"build\"        <- Only ignore these two folders")
    print("\nNote: You can run this file by double-clicking it on Windows!")
    print("=" * 70 + "\n")

def write_directory_tree():
    print_guide()
    
    # Target directory
    default_dir = os.path.dirname(os.path.abspath(__file__))
    target_dir = input(f"Enter target directory to scan [default: {default_dir}]: ").strip()
    if not target_dir:
        target_dir = default_dir
    
    if not os.path.isdir(target_dir):
        print(f"Error: '{target_dir}' is not a valid directory.")
        return

    # Ignore list
    default_ignores_str = ".git, __pycache__, .venv, node_modules, .idea, .vscode, whatishere.py, whatishere.txt"
    default_ignore_list = [item.strip() for item in default_ignores_str.split(",") if item.strip()]
    
    ignore_input = input(f"Enter files/folders to ignore (comma-separated, type 'none' to ignore nothing) [default: {default_ignores_str}]: ").strip()
    
    if not ignore_input:
        ignore_input = default_ignores_str
        
    # Parse ignores
    if ignore_input.lower() == 'none':
        ignore_set = set()
    else:
        import csv
        try:
            reader = csv.reader([ignore_input], skipinitialspace=True)
            ignore_list = [item.strip() for item in next(reader) if item.strip()]
        except Exception:
            # Fallback to simple split if csv parsing fails
            ignore_list = [item.strip() for item in ignore_input.split(",") if item.strip()]
            
        # Check if 'default' is requested in the custom ignore list
        if any(item.lower() == 'default' for item in ignore_list):
            ignore_list = [item for item in ignore_list if item.lower() != 'default']
            ignore_list.extend(default_ignore_list)
            
        ignore_set = set(ignore_list)

    # Output file
    default_output = "whatishere.txt"
    output_file = input(f"Enter output filename [default: {default_output}, type 'here' to show on screen]: ").strip()
    if not output_file:
        output_file = default_output
        
    # Resolve relative output path relative to target_dir
    if output_file.lower() != 'here' and not os.path.isabs(output_file):
        output_file = os.path.join(target_dir, output_file)
        
    # Automatically ignore the script itself and the output file (if writing to file and NOT ignoring 'none')
    if ignore_input.lower() != 'none':
        script_name = os.path.basename(__file__)
        ignore_set.add(script_name)
        if output_file.lower() != 'here':
            ignore_set.add(os.path.basename(output_file))

    print(f"\nScanning directory: {target_dir}...")
    print(f"Ignoring: {', '.join(sorted(ignore_set))}")

    if output_file.lower() != 'here':
        print(f"Writing structure to: {output_file}...")

    try:
        output_buffer = io.StringIO()
        output_buffer.write(f"Directory: {target_dir}\n")
        output_buffer.write(f"Ignored: {', '.join(sorted(ignore_set))}\n")
        output_buffer.write("=" * 60 + "\n\n")

        for dirpath, dirnames, filenames in os.walk(target_dir):
            # Filter out ignored directories in-place to prevent os.walk from descending into them
            dirnames[:] = [d for d in dirnames if d not in ignore_set]

            # Calculate relative depth
            rel_path = os.path.relpath(dirpath, target_dir)
            depth = 0 if rel_path == "." else rel_path.count(os.sep) + 1
            indent = "    " * depth

            # Folder name
            folder_name = os.path.basename(dirpath) if rel_path != "." else os.path.basename(target_dir)
            output_buffer.write(f"{indent}[{folder_name}/]\n")

            # Filter and sort files
            filenames = [file for file in filenames if file not in ignore_set]
            filenames.sort()

            # Files inside the folder
            sub_indent = "    " * (depth + 1)
            for filename in filenames:
                filepath = os.path.join(dirpath, filename)
                try:
                    size = os.path.getsize(filepath)
                    output_buffer.write(f"{sub_indent}{filename}  ({size:,} bytes)\n")
                except OSError:
                    output_buffer.write(f"{sub_indent}{filename}  (size unknown)\n")

        # Save or print the output
        if output_file.lower() == 'here':
            print("\n" + "=" * 60)
            print(output_buffer.getvalue().strip())
            print("=" * 60)
        else:
            with open(output_file, "w", encoding="utf-8") as f:
                f.write(output_buffer.getvalue())
            print(f"\nDone! Directory structure successfully saved to: {output_file}")
            
    except Exception as e:
        print(f"\nAn error occurred: {e}")

if __name__ == "__main__":
    while True:
        try:
            write_directory_tree()
        except KeyboardInterrupt:
            print("\n\nOperation cancelled by user.")
            break
        except Exception as e:
            print(f"\nAn unexpected error occurred: {e}")
            
        print("\n" + "=" * 70)
        again = input("Do you want to perform another scan? (y/n) [default: y]: ").strip().lower()
        if again in ('n', 'no'):
            print("\nGoodbye!")
            break
        print("\n" * 3)




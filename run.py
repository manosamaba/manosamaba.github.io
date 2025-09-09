import os
import subprocess
import time
import sys 

def main():
    """A simple script to automate the build and serve process."""

    # 1. Run the static site generator
    print("✨ Starting static site generation...")
    # Use the Python executable from the current environment
    subprocess.run([sys.executable, 'generate_pages.py'], check=True)
    print("✅ Generation complete!")

    # 2. Change the current directory to 'dist'
    os.chdir('dist')
    print("📁 Switched to 'dist' directory.")

    # 3. Start the local server
    print("🚀 Starting local server...")
    print("🌐 Open your browser and go to http://localhost:8000")

    try:
        # Start the server and keep it running
        subprocess.run([sys.executable, '-m', 'http.server'], check=True)
    except KeyboardInterrupt:
        print("\n👋 Server stopped.")
        # Change back to the parent directory on exit
        os.chdir('..')

if __name__ == '__main__':
    main()
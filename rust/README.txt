To compile this project into WASM
-install the cargo and cargo web environment
-run 'cargo web start --target=wasm32-unknown-unknown
-copy the following files from /target/wasm32-unknown-unknown/: project.js, project.wasm
-in project.js, rename the fetch string for project.wasm to where it is on the web server (in vue it's /static/project.wasm)

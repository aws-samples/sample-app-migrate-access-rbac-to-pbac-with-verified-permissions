BUILD_DIR=${PWD}

install:
	npm ci --production

build:
	npm run build

artifacts:
	# Copy node_modules - critical for Lambda execution
	mkdir -p $(ARTIFACTS_DIR)/node_modules
	cp -r node_modules/. $(ARTIFACTS_DIR)/node_modules/
	
	# Copy Next.js build artifacts
	mkdir -p $(ARTIFACTS_DIR)/.next
	cp -r .next/. $(ARTIFACTS_DIR)/.next/
	
	# Copy static resources
	mkdir -p $(ARTIFACTS_DIR)/public
	cp -r public/. $(ARTIFACTS_DIR)/public/
	
	# Copy essential files
	cp package.json $(ARTIFACTS_DIR)/
	cp next.config.js $(ARTIFACTS_DIR)/
	cp run.sh $(ARTIFACTS_DIR)/
	cp server.js $(ARTIFACTS_DIR)/
	
	# Set permissions
	chmod +x $(ARTIFACTS_DIR)/run.sh
	
	# Create cache directory
	mkdir -p $(ARTIFACTS_DIR)/.next/cache
	
	# Debug info
	echo "Artifacts directory contents:"
	ls -la $(ARTIFACTS_DIR)

build-AVPCognitoFunction: install build artifacts
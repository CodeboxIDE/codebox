SHELL = bash
NODE = $(shell which node)
NPM = $(shell which npm)
HR = node_modules/.bin/hr.js

.PHONY: all

all: build run

build:
	@echo ==== Build client ====
	$(HR) -d client build
	@echo

install:
ifeq ($(NPM),)
	@echo -e "npm not found.\nInstall it from https://npmjs.org/"
	@exit 1
else
	$(NPM) install .
endif

run:
	@echo ==== Run codebox ====
	$(NODE) bin/codebox.js run

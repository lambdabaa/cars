PACKAGES = $(wildcard packages/*)
BUILDJS :=
BUILDJSON :=

define addpackage
JS = $$(shell find $(1)/lib -name "*.js")
BUILDJS += $$(patsubst $(1)/lib/%.js, $(1)/build/%.js, $$(JS))
JSON = $$(shell find $(1)/lib -name "*.json")
BUILDJSON += $$(patsubst $(1)/lib/%.json, $(1)/build/%.json, $$(JSON))

$(1)/build/%.js: $(1)/lib/%.js
	@mkdir -p "$$(@D)"
	./node_modules/.bin/babel $$^ -o $$@

$(1)/build/%.json: $(1)/lib/%.json
	@mkdir -p "$$(@D)"
	cp $$^ $$@
endef

$(foreach package, $(PACKAGES), $(eval $(call addpackage, $(package))))

.PHONY: all
all: $(BUILDJS) $(BUILDJSON)

.PHONY: clean
clean:
	rm -rf packages/*/build

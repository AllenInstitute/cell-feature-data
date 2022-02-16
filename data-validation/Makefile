# SPEC = Specification
# TARGETS = $(SPEC).html $(SPEC).pdf
# all: $(TARGETS)

WETZEL = npx wetzel@0.2.2

SCHEMALINK = schema
EMBEDINPUTSCHEMA = DatasetHandoffSchema.adoc
INPUTREF = DatasetHandoffRef.adoc

EMBEDDATABASESCHEMA = DatabaseSchema.adoc
DATABASEREF = DatabaseRef.adoc

GENERATED = $(PROPREF) $(EMBEDINPUTSCHEMA) $(EMBEDDATABASESCHEMA) $(DATABASEREF)
$(GENERATED): $(wildcard schema/*schema.json)

input-docs:
	$(WETZEL) -n -a=cqo -m=a -p "$(SCHEMALINK)" -e "$(EMBEDINPUTSCHEMA)" \
		-c "icon:check[]" -k "**MUST**"\
		schema/input-dataset.schema.json > $(INPUTREF)

database-docs:
	$(WETZEL) -n -a=cqo -m=a -p "$(SCHEMALINK)" -e "$(EMBEDDATABASESCHEMA)" \
		-c "icon:check[]" -k "**MUST**"\
		schema/database.schema.json > $(DATABASEREF)

docs: 
	make input-docs
	make database-docs

clean: 
	-rm -f $(GENERATED) $(TARGETS)

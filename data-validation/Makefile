HANDOFF_SPEC = HandoffSpecification
DATABASE_SPEC = DatabaseSpecification
TARGETS = $(SPEC).html
# all: $(TARGETS)

WETZEL = ../node_modules/wetzel/bin/wetzel.js

SCHEMALINK = ../data-validation/schema

EMBEDINPUTSCHEMA = ../docs/DatasetHandoffSchema.adoc
INPUTREF = ../docs/DatasetHandoffRef.adoc

EMBEDDATABASESCHEMA = ../docs/DatabaseSchema.adoc
DATABASEREF = ../docs/DatabaseRef.adoc

GENERATED = $(EMBEDINPUTSCHEMA) $(INPUTREF) $(EMBEDDATABASESCHEMA) $(DATABASEREF)
$(GENERATED): $(wildcard schema/*schema.json)

ASCIIDOCTOR = npx asciidoctor 
ADOCOPTS = -d book
ADOCHTMLOPTS = -a stylesheet=khronos.css -a sectanchors

input-docs:
	$(WETZEL) -n -a=cqo -m=a -p "$(SCHEMALINK)" -e "$(EMBEDINPUTSCHEMA)" \
		schema/input-dataset.schema.json > $(INPUTREF)

database-docs:
	$(WETZEL) -n -a=cqo -m=a -p "$(SCHEMALINK)" -e "$(EMBEDDATABASESCHEMA)" \
		schema/database.schema.json > $(DATABASEREF)

convert-to-html:
	$(ASCIIDOCTOR) -D ../dist ../docs/${HANDOFF_SPEC}.adoc
	$(ASCIIDOCTOR) -D ../dist ../docs/${DATABASE_SPEC}.adoc

docs: 
	make input-docs
	make database-docs
	make convert-to-html

clean: 
	-rm -f $(GENERATED) $(TARGETS)

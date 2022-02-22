SPEC = Specification
TARGETS = $(SPEC).html
# all: $(TARGETS)

WETZEL = npx wetzel@0.2.2

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
SPECDEPS = $(SPEC).adoc $(GENERATED)

input-docs:
	$(WETZEL) -a=cqo -m=a -p "$(SCHEMALINK)" -e "$(EMBEDINPUTSCHEMA)" \
		schema/input-dataset.schema.json > $(INPUTREF)

database-docs:
	$(WETZEL) -a=cqo -m=a -p "$(SCHEMALINK)" -e "$(EMBEDDATABASESCHEMA)" \
		schema/database.schema.json > $(DATABASEREF)

convert-to-html:
	$(ASCIIDOCTOR) -D ../dist $(GENERATED) 
	$(ASCIIDOCTOR) -D ../dist ../docs/Specification.adoc

docs: 
	make input-docs
	make database-docs
	make convert-to-html

clean: 
	-rm -f $(GENERATED) $(TARGETS)

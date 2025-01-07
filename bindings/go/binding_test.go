package tree_sitter_toy_test

import (
	"testing"

	tree_sitter_toy "github.com/infastin/tree-sitter-toy/bindings/go"
	tree_sitter "github.com/tree-sitter/go-tree-sitter"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_toy.Language())
	if language == nil {
		t.Errorf("Error loading Toy grammar")
	}
}

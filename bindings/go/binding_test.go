package tree_sitter_toy_test

import (
	"testing"

	tree_sitter "github.com/tree-sitter/go-tree-sitter"
	tree_sitter_toy "github.com/tree-sitter/tree-sitter-toy/bindings/go"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_toy.Language())
	if language == nil {
		t.Errorf("Error loading Toy grammar")
	}
}

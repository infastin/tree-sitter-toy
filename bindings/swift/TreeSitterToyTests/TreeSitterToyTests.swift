import XCTest
import SwiftTreeSitter
import TreeSitterToy

final class TreeSitterToyTests: XCTestCase {
    func testCanLoadGrammar() throws {
        let parser = Parser()
        let language = Language(language: tree_sitter_toy())
        XCTAssertNoThrow(try parser.setLanguage(language),
                         "Error loading Toy grammar")
    }
}

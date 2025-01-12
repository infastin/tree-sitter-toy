; Based on tree-sitter-go.

; Identifiers
(field_identifier) @property

(identifier) @variable

(label_name) @label

; Function calls
(call_expression
  function: (identifier) @function.call)

(call_expression
  function: (selector_expression
    field: (field_identifier) @function.method.call))

; Constructors
((tuple_literal
  "tuple" @constructor))

(call_expression
  (identifier) @constructor
  (#any-of? @constructor
    "string" "int" "bool" "float" "char" "bytes" "error" "range"))

; Operators
[
  "--"
  "-"
  "-="
  ":="
  "!"
  "!="
  "..."
  "*"
  "*"
  "*="
  "/"
  "/="
  "&"
  "&&"
  "&="
  "&^"
  "&^="
  "%"
  "%="
  "^"
  "^="
  "+"
  "++"
  "+="
  "<"
  "<<"
  "<<="
  "<="
  "="
  "=="
  ">"
  ">="
  ">>"
  ">>="
  "|"
  "|="
  "||"
  "?"
  ":"
  "=>"
] @operator

; Keywords
[
  "break"
  "continue"
  "defer"
  "immutable"
  "in"
] @keyword

"fn" @keyword.function

"return" @keyword.return

"for" @keyword.repeat

[
  "import"
  "export"
] @keyword.import

[
  "if"
  "else"
] @keyword.conditional

; Builtin functions
((identifier) @function.builtin
  (#any-of? @function.builtin
    "typename" "copy" "len" "append" "delete" "splice" "insert" "clear"
    "format" "fail" "min" "max"))

; Delimiters

[
  "."
  ","
  ":"
  ";"
] @punctuation.delimiter

[
  "(" ")"
  "{" "}"
  "[" "]"
] @punctuation.bracket

; Literals
(interpreted_string_literal) @string

(raw_string_literal) @string

(rune_literal) @string

(escape_sequence) @string.escape

(int_literal) @number

(float_literal) @number.float

[
  (true)
  (false)
] @boolean

[
  (nil)
] @constant.builtin

; Comments
(comment) @comment @spell

; Regex
(call_expression
  (selector_expression) @_function
  (#any-of? @_function
    "regexp.match" "regexp.compile" "regexp.find" "regexp.replace")
  (argument_list
    .
    [
      (raw_string_literal
        (raw_string_literal_content) @string.regexp)
      (interpreted_string_literal
        (interpreted_string_literal_content) @string.regexp)
    ]))

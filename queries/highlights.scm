; Identifiers
(field_identifier) @property

(identifier) @variable

(label_name) @label

; Types
((identifier) @type.builtin
  (#any-of? @type.builtin
    "type" "bool" "float" "int" "string" "bytes" "char"
    "array" "table" "tuple" "range" "function"))

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
    "type" "bool" "float" "int" "string" "bytes" "char" "array" "table" "range"))

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
  "=>"
  "??"
  "??="
] @operator

(cond_expression
  [":"] @operator)

; Keywords
[
  "break"
  "continue"
  "defer"
  "in"
] @keyword

[
  "try"
  "throw"
] @keyword.exception

"fn" @keyword.function

"return" @keyword.return

"for" @keyword.repeat

[
  "import"
] @keyword.import

[
  "if"
  "else"
] @keyword.conditional

; Builtin functions
((identifier) @function.builtin
  (#any-of? @function.builtin
    "typename" "clone" "freeze" "satisfies" "immutable"
    "len" "append" "copy" "delete" "splice" "insert" "clear" "contains"
    "format" "min" "max"))

; Literals
(string_literal) @string

(raw_string_literal) @string

(indented_string_literal) @string

(rune_literal) @string

(escape_sequence) @string.escape

(int_literal) @number

(float_literal) @number.float

(map_literal
  (identifier) @variable.member)

[
  (true)
  (false)
] @boolean

[
  (nil)
] @constant.builtin

; Braces in literals
(map_literal
  ["{" "}"] @punctuation.special)

(string_interpolation
  ["{" "}"] @punctuation.special)

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
      (string_literal
        (string_literal_content) @string.regexp)
      (raw_string_literal
        (raw_string_literal_content) @string.regexp)
      (indented_string_literal
        (indented_string_literal_content) @string.regexp)
    ]))

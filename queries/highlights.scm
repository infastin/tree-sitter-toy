; Function calls

(call_expression
  function: (identifier) @function)

(call_expression
  function: (identifier) @function.builtin
  (#match? @function.builtin "^(typename|copy|len|append|delete|splice|insert|clear|format|range|error)$"))

(call_expression
  function: (selector_expression
    field: (field_identifier) @function.method))

; Identifiers

(field_identifier) @property
(identifier) @variable

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
  "%"
  "%="
  "^"
  "^="
  "+"
  "++"
  "+="
  "<-"
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
  "~"
  "=>"
] @operator

; Keywords

[
  "break"
  "continue"
  "else"
  "for"
  "fn"
  "immutable"
  "unpack"
  "tuple"
  "if"
  "return"
  "export"
  "in"
  "import"
] @keyword

; Literals

[
  (interpreted_string_literal)
  (raw_string_literal)
  (rune_literal)
] @string

(escape_sequence) @escape

[
  (int_literal)
  (float_literal)
  (imaginary_literal)
] @number

[
  (true)
  (false)
  (undefined)
] @constant.builtin

(comment) @comment

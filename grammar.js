// Based on tree-sitter-go.

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

const PREC = {
  primary: 8,
  unary: 7,
  multiplicative: 6,
  additive: 5,
  comparative: 4,
  and: 3,
  or: 2,
  other: 1,
  composite_literal: -1,
};

const multiplicativeOperators = ['*', '/', '%', '<<', '>>', '&', '&^'];
const additiveOperators = ['+', '-', '|', '^'];
const otherOperators = ['??'];
const comparativeOperators = ['==', '!=', '<', '<=', '>', '>='];
const assignmentOperators = multiplicativeOperators.
  concat(additiveOperators).
  concat(otherOperators).
  concat(':').
  map(operator => operator + '=').
  concat('=');

const newline = /\n/;
const terminator = choice(newline, ';', '\0');

const hexDigit = /[0-9a-fA-F]/;
const octalDigit = /[0-7]/;
const decimalDigit = /[0-9]/;
const binaryDigit = /[01]/;

const hexDigits = seq(hexDigit, repeat(seq(optional('_'), hexDigit)));
const octalDigits = seq(octalDigit, repeat(seq(optional('_'), octalDigit)));
const decimalDigits = seq(decimalDigit, repeat(seq(optional('_'), decimalDigit)));
const binaryDigits = seq(binaryDigit, repeat(seq(optional('_'), binaryDigit)));

const hexLiteral = seq('0', choice('x', 'X'), optional('_'), hexDigits);
const octalLiteral = seq('0', optional(choice('o', 'O')), optional('_'), octalDigits);
const decimalLiteral = choice('0', seq(/[1-9]/, optional(seq(optional('_'), decimalDigits))));
const binaryLiteral = seq('0', choice('b', 'B'), optional('_'), binaryDigits);

const intLiteral = choice(binaryLiteral, decimalLiteral, octalLiteral, hexLiteral);

const decimalExponent = seq(choice('e', 'E'), optional(choice('+', '-')), decimalDigits);
const decimalFloatLiteral = choice(
  seq(decimalDigits, '.', optional(decimalDigits), optional(decimalExponent)),
  seq(decimalDigits, decimalExponent),
  seq('.', decimalDigits, optional(decimalExponent)),
);

const hexExponent = seq(choice('p', 'P'), optional(choice('+', '-')), decimalDigits);
const hexMantissa = choice(
  seq(optional('_'), hexDigits, '.', optional(hexDigits)),
  seq(optional('_'), hexDigits),
  seq('.', hexDigits),
);
const hexFloatLiteral = seq('0', choice('x', 'X'), hexMantissa, hexExponent);

const floatLiteral = choice(decimalFloatLiteral, hexFloatLiteral);

module.exports = grammar({
  name: "toy",

  extras: $ => [
    $.comment,
    /\s/,
  ],

  inline: $ => [
    $._field_identifier,
    $._string_literal,
  ],

  word: $ => $.identifier,

  supertypes: $ => [
    $._expression,
    $._statement,
    $._simple_statement,
  ],

  rules: {
    source_file: $ => repeat(seq($._statement, terminator)),

    _statement_list: $ => repeat1(seq($._statement, terminator)),

    _statement: $ => choice(
      $._simple_statement,
      $.return_statement,
      $.defer_statement,
      $.throw_statement,
      $.labeled_statement,
      $.if_statement,
      $.for_statement,
      $.break_statement,
      $.continue_statement,
      $.block,
      $.empty_statement,
    ),

    _simple_statement: $ => choice(
      $.expression_statement,
      $.inc_statement,
      $.dec_statement,
      $.assignment_statement,
    ),

    expression_statement: $ => $._expression,

    inc_statement: $ => seq(
      $._expression,
      '++',
    ),

    dec_statement: $ => seq(
      $._expression,
      '--',
    ),

    assignment_statement: $ => seq(
      field('left', $.expression_list),
      field('operator', choice(...assignmentOperators)),
      field('right', $.expression_list),
    ),

    labeled_statement: $ => seq(
      field('label', alias($.identifier, $.label_name)),
      ':',
      $._statement,
    ),

    _expression: $ => choice(
      $.unary_expression,
      $.binary_expression,
      $.cond_expression,
      $.selector_expression,
      $.index_expression,
      $.slice_expression,
      $.call_expression,
      $.identifier,
      $.table_literal,
      $.array_literal,
      $.tuple_literal,
      $.func_literal,
      $.import_expression,
      $.try_expression,
      $._string_literal,
      $.int_literal,
      $.float_literal,
      $.rune_literal,
      $.nil,
      $.true,
      $.false,
      $.parenthesized_expression,
    ),

    unary_expression: $ => prec(PREC.unary, seq(
      field('operator', choice('+', '-', '!', '^')),
      field('operand', $._expression),
    )),

    binary_expression: $ => {
      const table = [
        [PREC.multiplicative, choice(...multiplicativeOperators)],
        [PREC.additive, choice(...additiveOperators)],
        [PREC.comparative, choice(...comparativeOperators)],
        [PREC.and, '&&'],
        [PREC.or, '||'],
        [PREC.other, '??'],
      ];

      return choice(...table.map(([precedence, operator]) =>
        // @ts-ignore
        prec.left(precedence, seq(
          field('left', $._expression),
          // @ts-ignore
          field('operator', operator),
          field('right', $._expression),
        )),
      ));
    },
    
    cond_expression: $ => prec.left(seq($._expression, '?', $._expression, ':', $._expression)),

    selector_expression: $ => prec(PREC.primary, seq(
      field('operand', $._expression),
      '.',
      field('field', $._field_identifier),
    )),

    index_expression: $ => prec(PREC.primary, seq(
      field('operand', $._expression),
      '[',
      field('index', $._expression),
      ']',
    )),

    slice_expression: $ => prec(PREC.primary, seq(
      field('operand', $._expression),
      '[',
      seq(
        field('start', optional($._expression)),
        ':',
        field('end', optional($._expression)),
      ),
      ']',
    )),

    call_expression: $ => prec(PREC.primary, seq(
      field('function', $._expression),
      field('arguments', $.argument_list),
    )),

    argument_list: $ => seq(
      '(',
      commaSep(seq(
        optional('...'),
        $._expression,
      )),
      optional(','),
      ')',
    ),

    table_literal: $ => prec(PREC.composite_literal, seq(
      '{',
      commaSep(
        choice(
          seq(
            field('key', choice(
              $.identifier,
              seq('[', $._expression, ']'),
            )),
            ':',
            field('value', $._expression),
          ),
          seq('...', $._expression),
        ),
      ),
      optional(','),
      '}',
    )),

    array_literal: $ => prec(PREC.composite_literal, seq(
      '[',
      commaSep(seq(
        optional('...'),
        $._expression,
      )),
      optional(','),
      ']',
    )),

    tuple_literal: $ => prec(PREC.composite_literal, seq(
      'tuple',
      '(',
      commaSep(seq(
        optional('...'),
        $._expression,
      )),
      optional(','),
      ')',
    )),

    func_literal: $ => seq(
      'fn',
      field('parameters', $.parameter_list),
      field('body', $.func_body),
    ),

    parameter_list: $ => seq(
      '(',
      commaSep(seq(
        optional('...'),
        field('name', $.identifier),
        optional('?'),
      )),
      optional(','),
      ')',
    ),

    func_body: $ => choice(
      seq('=>', prec.left($._expression)),
      $.block,
    ),

    import_expression: $ => prec(PREC.primary, seq('import', '(', $._string_literal, ')')),

    try_expression: $ => prec(PREC.primary, seq('try', $.call_expression)),

    expression_list: $ => commaSep1($._expression),

    block: $ => seq(
      '{',
      optional($._statement_list),
      '}',
    ),

    empty_statement: _ => ';',

    break_statement: $ => seq('break', optional(alias($.identifier, $.label_name))),

    continue_statement: $ => seq('continue', optional(alias($.identifier, $.label_name))),

    return_statement: $ => seq('return', optional($.expression_list)),

    defer_statement: $ => seq('defer', $.call_expression),

    throw_statement: $ => seq('throw', optional($.expression_list)),

    if_statement: $ => seq(
      'if',
      optional(seq(
        field('initializer', $._simple_statement),
        ';',
      )),
      field('condition', $._expression),
      field('consequence', $.block),
      optional(seq(
        'else',
        field('alternative', choice($.block, $.if_statement)),
      )),
    ),

    for_statement: $ => seq(
      'for',
      optional(choice(
        $._expression,
        seq(
          field('initializer', optional($._simple_statement)),
          ';',
          field('condition', optional($._expression)),
          ';',
          field('update', optional($._simple_statement)),
        ),
        seq(
          field('left', $.expression_list),
          'in',
          field('right', $._expression),
        )
      )),
      field('body', $.block),
    ),

    parenthesized_expression: $ => seq(
      '(',
      $._expression,
      ')',
    ),

    identifier: _ => /[_\p{XID_Start}][_\p{XID_Continue}]*/,

    _field_identifier: $ => alias($.identifier, $.field_identifier),

    _string_literal: $ => choice(
      $.string_literal,
      $.raw_string_literal,
      $.indented_string_literal,
    ),

    string_literal: $ => seq(
      '"',
      repeat(choice(
        alias(token.immediate(prec(2, /[^"\n\\{]+/)), $.string_literal_content),
        $.string_interpolation,
        $.escape_sequence,
      )),
      '"',
    ),

    raw_string_literal: $ => seq(
      '`',
      repeat(choice(
        alias(token.immediate(prec(2, /[^`\\]+/)), $.raw_string_literal_content),
        $.string_interpolation,
        $.escape_sequence,
      )),
      '`',
    ),

    indented_string_literal: $ => seq(
      "''",
      repeat(choice(
        alias(token.immediate(prec(2, /[^'\\{]+/)), $.indented_string_literal_content),
        seq(
          alias("'", $.indented_string_literal_content),
          choice(
            alias(token.immediate(prec(2, /[^'\\{]+/)), $.indented_string_literal_content),
            $.string_interpolation,
            $.escape_sequence,
          ),
        ),
        $.string_interpolation,
        $.escape_sequence,
      )),
      "''",
    ),

    string_interpolation: $ => seq('{', $._expression, '}'),

    escape_sequence: _ => token.immediate(seq(
      '\\',
      choice(
        /[^xuU]/,
        /\d{2,3}/,
        /x[0-9a-fA-F]{2,}/,
        /u[0-9a-fA-F]{4}/,
        /U[0-9a-fA-F]{8}/,
      ),
    )),

    int_literal: _ => token(intLiteral),

    float_literal: _ => token(floatLiteral),

    rune_literal: _ => token(seq(
      '\'',
      choice(
        /[^'\\]/,
        seq(
          '\\',
          choice(
            seq('x', hexDigit, hexDigit),
            seq(octalDigit, octalDigit, octalDigit),
            seq('u', hexDigit, hexDigit, hexDigit, hexDigit),
            seq('U', hexDigit, hexDigit, hexDigit, hexDigit, hexDigit, hexDigit, hexDigit, hexDigit),
            seq(choice('a', 'b', 'f', 'n', 'r', 't', 'v', '\\', '\'', '"')),
          ),
        ),
      ),
      '\'',
    )),

    nil: _ => 'nil',
    true: _ => 'true',
    false: _ => 'false',

    // http://stackoverflow.com/questions/13014947/regex-to-match-a-c-style-multiline-comment/36328890#36328890
    comment: _ => token(choice(
      seq('//', /.*/),
      seq(
        '/*',
        /[^*]*\*+([^/*][^*]*\*+)*/,
        '/',
      ),
    )),
  },
});

/**
 * Creates a rule to match one or more occurrences of `rule` separated by `sep`
 *
 * @param {RuleOrLiteral} rule
 *
 * @param {RuleOrLiteral} separator
 *
 * @returns {SeqRule}
 */
function sep1(rule, separator) {
  return seq(rule, repeat(seq(separator, rule)));
}

/**
 * Creates a rule to match one or more of the rules separated by a comma
 *
 * @param {Rule} rule
 *
 * @returns {SeqRule}
 */
function commaSep1(rule) {
  return seq(rule, repeat(seq(',', rule)));
}

/**
 * Creates a rule to optionally match one or more of the rules separated by a comma
 *
 * @param {Rule} rule
 *
 * @returns {ChoiceRule}
 */
function commaSep(rule) {
  return optional(commaSep1(rule));
}

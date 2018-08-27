export default [
  {
    group: "rendering",
    properties: [
      {
        css: "display",
        syntax: [
          { value: "initial" },
          { value: "inherit" },
          { value: "none" },
          { value: "block" },
          { value: "inline-block" },
          { value: "inline" },
          { value: "run-in" },
          { value: "list-item" },
          {
            group: "flex",
            values: [
              { value: "flex" },
              { value: "inline-flex" },
            ],
          },
          {
            group: "table",
            values: [
              { value: "table" },
              { value: "inline-table" },
              { value: "table-caption" },
              { value: "table-column-group" },
              { value: "table-header-group" },
              { value: "table-footer-group" },
              { value: "table-row-group" },
              { value: "table-cell" },
              { value: "table-column" },
              { value: "table-row" },],
          },
        ],
      },
      {
        css: "visibility",
        syntax: [
          { value: "initial" },
          { value: "inherit" },
          { value: "visible" },
          { value: "hidden" },
          { value: "collapse" },
        ],
      },
      {
        css: "box-shadow",
        syntax: [
          { value: "initial" },
          { value: "inherit" },
          { value: "none" },
        ],
      },
      {
        css: "cursor",
        syntax: [
          { value: "initial" },
          { value: "none" },
          { value: "default" },
          { value: "auto" },
          {
            group: "general",
            values: [
              { value: "alias" },
              { value: "all-scroll" },
              { value: "cell" },
              { value: "context-menu" },
              { value: "copy" },
              { value: "crosshair" },
              { value: "grab" },
              { value: "grabbing" },
              { value: "help" },
              { value: "move" },
              { value: "no-drop" },
              { value: "not-allowed" },
              { value: "pointer" },
              { value: "progress" },
              { value: "text" },
              { value: "vertical-text" },
              { value: "wait" },
              { value: "zoom-in" },
              { value: "zoom-out" },
            ],
          },
          {
            group: "resize",
            values: [
              { value: "col-resize" },
              { value: "e-resize" },
              { value: "ew-resize" },
              { value: "n-resize" },
              { value: "ne-resize" },
              { value: "nesw-resize" },
              { value: "ns-resize" },
              { value: "nw-resize" },
              { value: "nwse-resize" },
              { value: "row-resize" },
              { value: "s-resize" },
              { value: "se-resize" },
              { value: "sw-resize" },
              { value: "w-resize" },
            ],
          },
        ],
      },
    ],
  },
  {
    group: "dimensions",
    properties: [
      {
        css: "width",
        syntax: [],
      },
      {
        css: "height",
        syntax: [],
      },
      {
        css: "minWidth",
        syntax: [],
      },
      {
        css: "minHeight",
        syntax: [],
      },
      {
        css: "maxWidth",
        syntax: [],
      },
      {
        css: "maxHeight",
        syntax: [],
      },
    ]
  },
  {
    group: "positioning",
    properties: [
      {
        css: "position",
        syntax: [
          { value: "initial" },
          { value: "inherit" },
          { value: "static" },
          { value: "absolute" },
          { value: "fixed" },
          { value: "relative" },
        ],
      },
      {
        css: "top",
        syntax: [],
      },
      {
        css: "right",
        syntax: [],
      },
      {
        css: "bottom",
        syntax: [],
      },
      {
        css: "left",
        syntax: [],
      },
      {
        css: "zIndex",
        syntax: [],
      },
    ]
  },
  {
    group: "margins",
    properties: [
      {
        css: "marginTop",
        syntax: [],
      },
      {
        css: "marginRight",
        syntax: [],
      },
      {
        css: "marginBottom",
        syntax: [],
      },
      {
        css: "marginLeft",
        syntax: [],
      },
    ]
  },
  {
    group: "paddings",
    properties: [
      {
        css: "paddingTop",
        syntax: [],
      },
      {
        css: "paddingRight",
        syntax: [],
      },
      {
        css: "paddingBottom",
        syntax: [],
      },
      {
        css: "paddingLeft",
        syntax: [],
      },
    ]
  },
  {
    group: "overflow",
    properties: [
      {
        css: "overflowX",
        syntax: [],
      },
      {
        css: "overflowY",
        syntax: [],
      },
    ]
  },
  {
    group: "flex",
    properties: [
      {
        css: "alignContent",
        syntax: [],
      },
      {
        css: "alignItems",
        syntax: [],
      },
      {
        css: "alignSelf",
        syntax: [],
      },
      {
        css: "flexBasis",
        syntax: [],
      },
      {
        css: "flexDirection",
        syntax: [],
      },
      {
        css: "flexFlow",
        syntax: [],
      },
    ]
  },
  {
    group: "columns",
    properties: [
      {
        css: "columnCount",
        syntax: [],
      },
      {
        css: "columnFill",
        syntax: [],
      },
      {
        css: "columnGap",
        syntax: [],
      },
      {
        css: "columnRuleColor",
        syntax: [],
        editor: "COLOR"
      },
      {
        css: "columnRuleStyle",
        syntax: [],
      },
      {
        css: "columnRuleWidth",
        syntax: [],
      },
      {
        css: "columnSpan",
        syntax: [],
      },
      {
        css: "columnWidth",
        syntax: [],
      },
    ]
  },
  {
    group: "transform",
    properties: [
      {
        css: "transform",
        syntax: [
          { value: "initial" },
          { value: "inherit" },
          { value: "none" },
        ]
      },
      {
        css: "transform-origin",
        syntax: [
          { value: "initial" },
          { value: "inherit" },
          {
            template: "custom",
            syntax: [
              { key: "x-axis", initial: "0px", types: "DIM" },
              { key: "y-axis", initial: "0px", types: "DIM" },
              { key: "z-axis", initial: "0px", types: "DIM" },
            ]
          },
        ]
      },
      {
        css: "transformStyle",
        syntax: [
          { value: "initial" },
          { value: "inherit" },
          { value: "flat" },
          { value: "preserve-3d" },
        ]
      },
    ],
  },
  {
    group: "background",
    properties: [
      {
        css: "backgroundColor",
        syntax: [],
        editor: "COLOR"
      },
      {
        css: "backgroundImage",
        syntax: [],
      },
      {
        css: "backgroundAttachment",
        syntax: [],
      },
      {
        css: "backgroundClip",
        syntax: [],
      },
      {
        css: "backgroundOrigin",
        syntax: [],
      },
      {
        css: "backgroundPosition",
        syntax: [],
      },
      {
        css: "backgroundRepeat",
        syntax: [],
      },
      {
        css: "backgroundSize",
        syntax: [],
      },
    ],
  },
  {
    group: "border",
    properties: [
      {
        css: "borderCollapse",
        syntax: [],
      },
      {
        css: "borderColor",
        syntax: [],
        editor: "COLOR"
      },
      {
        css: "borderImage",
        syntax: [],
      },
      {
        css: "borderImageOutset",
        syntax: [],
      },
      {
        css: "borderImageRepeat",
        syntax: [],
      },
      {
        css: "borderRadius",
        syntax: [],
      },
      {
        css: "borderWidth",
        syntax: [],
      },
      {
        css: "borderStyle",
        syntax: [
          { value: "initial" },
          { value: "inherit" },
          { value: "none" },
          { value: "hidden" },
          { value: "dotted" },
          { value: "dashed" },
          { value: "solid" },
          { value: "double" },
          { value: "groove" },
          { value: "ridge" },
          { value: "inset" },
          { value: "outset" }
        ],
      },
      {
        css: "borderSpacing",
        syntax: [],
      },
    ],
  },
  {
    group: "listStyle",
    properties: [
      {
        css: "listStyleImage",
        syntax: [],
      },
      {
        css: "listStylePosition",
        syntax: [],
      },
      {
        css: "listStyleType",
        syntax: [],
      },
    ],
  },
  {
    group: "text",
    properties: [
      {
        css: "color",
        syntax: [],
      },
      {
        css: "fontFamily",
        syntax: [],
      },
      {
        css: "fontFeatureSettings",
        syntax: [],
      },
      {
        css: "fontSize",
        syntax: [],
      },
      {
        css: "fontSizeAdjust",
        syntax: [],
      },
      {
        css: "fontStretch",
        syntax: [],
      },
      {
        css: "fontStyle",
        syntax: [],
      },
      {
        css: "fontVariant",
        syntax: [],
      },
      {
        css: "fontWeight",
        syntax: [],
      },
      {
        css: "textAlign",
        syntax: [],
      },
      {
        css: "textAlignLast",
        syntax: [],
      },
      {
        css: "textAnchor",
        syntax: [],
      },
      {
        css: "textDecoration",
        syntax: [],
      },
      {
        css: "textIndent",
        syntax: [],
      },
      {
        css: "textJustify",
        syntax: [],
      },
      {
        css: "textOverflow",
        syntax: [],
      },
      {
        css: "textShadow",
        syntax: [],
      },
      {
        css: "textTransform",
        syntax: [],
      },
      {
        css: "textUnderlinePosition",
        syntax: [],
      },
      {
        css: "whiteSpace",
        syntax: [],
      },
      {
        css: "lineHeight",
        syntax: [],
      },
      {
        css: "wordBreak",
        syntax: [],
      },
      {
        css: "wordSpacing",
        syntax: [],
      },
      {
        css: "wordWrap",
        syntax: [],
      },
      {
        css: "letterSpacing",
        syntax: [],
      },
    ],
  },
  {
    group: "outline",
    properties: [
      {
        css: "outlineColor",
        syntax: [],
        editor: "COLOR"
      },
      {
        css: "outlineStyle",
        syntax: [],
      },
      {
        css: "outlineWidth",
        syntax: [],
      }
    ]
  },
];
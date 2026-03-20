module.exports = [
"[project]/draft-kit/packages/draftkit-core/src/index.ts [app-ssr] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
;
;
;
;
}),
"[project]/draft-kit/packages/draftkit-core/src/layout.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "LAYOUT_PRIMITIVES",
    ()=>LAYOUT_PRIMITIVES,
    "defaultRegistry",
    ()=>defaultRegistry
]);
const LAYOUT_PRIMITIVES = [
    "Page",
    "Section",
    "Container",
    "Stack",
    "Inline",
    "Grid",
    "Spacer",
    "Divider"
];
const defaultRegistry = {
    Page: {
        name: "Page",
        allowedProps: [
            "padding",
            "background"
        ]
    },
    Section: {
        name: "Section",
        allowedProps: [
            "paddingY",
            "background"
        ]
    },
    Container: {
        name: "Container",
        allowedProps: [
            "maxWidth",
            "paddingX"
        ]
    },
    Stack: {
        name: "Stack",
        allowedProps: [
            "gap",
            "align",
            "justify"
        ]
    },
    Inline: {
        name: "Inline",
        allowedProps: [
            "gap",
            "align",
            "wrap"
        ]
    },
    Grid: {
        name: "Grid",
        allowedProps: [
            "columns",
            "gap"
        ]
    },
    Spacer: {
        name: "Spacer",
        allowedProps: [
            "size"
        ]
    },
    Divider: {
        name: "Divider",
        allowedProps: [
            "marginY"
        ]
    },
    Card: {
        name: "Card",
        allowedProps: [
            "title",
            "description"
        ]
    },
    Button: {
        name: "Button",
        allowedProps: [
            "variant",
            "size"
        ]
    },
    Badge: {
        name: "Badge",
        allowedProps: [
            "variant"
        ]
    },
    Input: {
        name: "Input",
        allowedProps: [
            "placeholder"
        ]
    },
    Text: {
        name: "Text",
        allowedProps: [
            "size",
            "weight",
            "tone"
        ]
    }
};
}),
"[project]/draft-kit/packages/draftkit-core/src/mock-generator.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createMockDraft",
    ()=>createMockDraft
]);
function basePage(children) {
    return {
        type: "Page",
        props: {
            padding: 24
        },
        children: [
            {
                type: "Container",
                props: {
                    maxWidth: 960,
                    paddingX: 16
                },
                children: [
                    {
                        type: "Stack",
                        props: {
                            gap: 16
                        },
                        children
                    }
                ]
            }
        ]
    };
}
function createMockDraft(prompt, registry) {
    const lowerPrompt = prompt.toLowerCase();
    const heroChildren = [
        {
            type: "Badge",
            props: {
                variant: "secondary"
            },
            text: "DraftKit MVP"
        },
        {
            type: "Text",
            props: {
                size: "xl",
                weight: "bold"
            },
            text: "자연어로 UI 초안 생성"
        },
        {
            type: "Text",
            props: {
                size: "md",
                tone: "muted"
            },
            text: "이 화면은 실제 LLM 대신 mock generator로 만들어졌습니다."
        }
    ];
    if (lowerPrompt.includes("form")) {
        heroChildren.push({
            type: "Card",
            props: {
                title: "문의 폼",
                description: "이름과 메시지를 입력하고 제출합니다."
            },
            children: [
                {
                    type: "Input",
                    props: {
                        placeholder: "이름"
                    }
                },
                {
                    type: "Input",
                    props: {
                        placeholder: "메시지"
                    }
                },
                {
                    type: "Button",
                    text: "Submit",
                    props: {
                        variant: "default"
                    }
                }
            ]
        });
    } else {
        heroChildren.push({
            type: "Inline",
            props: {
                gap: 8,
                align: "center",
                wrap: true
            },
            children: [
                {
                    type: "Button",
                    text: "기본 버튼",
                    props: {
                        variant: "default"
                    }
                },
                {
                    type: "Button",
                    text: "보조 버튼",
                    props: {
                        variant: "outline"
                    }
                }
            ]
        });
    }
    const draft = basePage(heroChildren);
    return pruneUnknownComponents(draft, registry);
}
function pruneUnknownComponents(node, registry) {
    const fallbackType = registry[node.type] ? node.type : "Text";
    const safeText = fallbackType === "Text" && !node.text ? `${node.type} 컴포넌트는 현재 registry에 없습니다.` : node.text;
    return {
        type: fallbackType,
        props: node.props,
        text: safeText,
        children: node.children?.map((child)=>pruneUnknownComponents(child, registry))
    };
}
}),
"[project]/draft-kit/packages/draftkit-core/src/serialize.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "serializeDraftToJsx",
    ()=>serializeDraftToJsx
]);
function toPropsString(props) {
    if (!props) return "";
    const entries = Object.entries(props).map(([key, value])=>{
        if (typeof value === "string") {
            return `${key}="${value}"`;
        }
        return `${key}={${String(value)}}`;
    });
    return entries.length > 0 ? ` ${entries.join(" ")}` : "";
}
function toJsx(node, depth) {
    const pad = "  ".repeat(depth);
    const props = toPropsString(node.props);
    const hasChildren = Boolean(node.children && node.children.length > 0);
    const hasText = Boolean(node.text);
    if (!hasChildren && !hasText) {
        return `${pad}<${node.type}${props} />`;
    }
    const lines = [
        `${pad}<${node.type}${props}>`
    ];
    if (node.text) {
        lines.push(`${pad}  ${node.text}`);
    }
    if (node.children) {
        for (const child of node.children){
            lines.push(toJsx(child, depth + 1));
        }
    }
    lines.push(`${pad}</${node.type}>`);
    return lines.join("\n");
}
function serializeDraftToJsx(node) {
    return [
        "export default function DraftOutput() {",
        "  return (",
        toJsx(node, 2),
        "  );",
        "}"
    ].join("\n");
}
}),
"[project]/draft-kit/packages/draftkit-core/src/validate.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "validateDraft",
    ()=>validateDraft
]);
function walk(node, path, registry, issues) {
    const spec = registry[node.type];
    if (!spec) {
        issues.push({
            path,
            message: `허용되지 않은 컴포넌트입니다: ${node.type}`
        });
    }
    const props = node.props ?? {};
    for (const key of Object.keys(props)){
        if (spec && !spec.allowedProps.includes(key)) {
            issues.push({
                path,
                message: `${node.type}의 허용되지 않은 prop: ${key}`
            });
        }
    }
    node.children?.forEach((child, index)=>{
        walk(child, `${path}.${node.type}[${index}]`, registry, issues);
    });
}
function validateDraft(draft, registry) {
    const issues = [];
    walk(draft, "root", registry, issues);
    return {
        ok: issues.length === 0,
        issues
    };
}
}),
"[project]/draft-kit/packages/draftkit-react/src/primitives.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Container",
    ()=>Container,
    "Divider",
    ()=>Divider,
    "Grid",
    ()=>Grid,
    "Inline",
    ()=>Inline,
    "Page",
    ()=>Page,
    "Section",
    ()=>Section,
    "Spacer",
    ()=>Spacer,
    "Stack",
    ()=>Stack
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$draft$2d$kit$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$0_$40$babel$2b$core$40$7$2e$29$2e$0_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/draft-kit/node_modules/.pnpm/next@16.2.0_@babel+core@7.29.0_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
;
function Page({ children, style }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$draft$2d$kit$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$0_$40$babel$2b$core$40$7$2e$29$2e$0_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            minHeight: "100%",
            background: "var(--background)",
            color: "var(--foreground)",
            ...style
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/draft-kit/packages/draftkit-react/src/primitives.tsx",
        lineNumber: 9,
        columnNumber: 5
    }, this);
}
function Section({ children, style }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$draft$2d$kit$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$0_$40$babel$2b$core$40$7$2e$29$2e$0_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        style: {
            ...style
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/draft-kit/packages/draftkit-react/src/primitives.tsx",
        lineNumber: 23,
        columnNumber: 10
    }, this);
}
function Container({ children, style }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$draft$2d$kit$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$0_$40$babel$2b$core$40$7$2e$29$2e$0_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            width: "100%",
            maxWidth: 960,
            margin: "0 auto",
            ...style
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/draft-kit/packages/draftkit-react/src/primitives.tsx",
        lineNumber: 28,
        columnNumber: 5
    }, this);
}
function Stack({ children, style }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$draft$2d$kit$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$0_$40$babel$2b$core$40$7$2e$29$2e$0_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            display: "grid",
            gap: 12,
            ...style
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/draft-kit/packages/draftkit-react/src/primitives.tsx",
        lineNumber: 42,
        columnNumber: 10
    }, this);
}
function Inline({ children, style }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$draft$2d$kit$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$0_$40$babel$2b$core$40$7$2e$29$2e$0_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            alignItems: "center",
            ...style
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/draft-kit/packages/draftkit-react/src/primitives.tsx",
        lineNumber: 47,
        columnNumber: 5
    }, this);
}
function Grid({ children, style }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$draft$2d$kit$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$0_$40$babel$2b$core$40$7$2e$29$2e$0_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            display: "grid",
            gap: 12,
            ...style
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/draft-kit/packages/draftkit-react/src/primitives.tsx",
        lineNumber: 62,
        columnNumber: 10
    }, this);
}
function Spacer({ style }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$draft$2d$kit$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$0_$40$babel$2b$core$40$7$2e$29$2e$0_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            height: 8,
            ...style
        }
    }, void 0, false, {
        fileName: "[project]/draft-kit/packages/draftkit-react/src/primitives.tsx",
        lineNumber: 66,
        columnNumber: 10
    }, this);
}
function Divider({ style }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$draft$2d$kit$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$0_$40$babel$2b$core$40$7$2e$29$2e$0_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("hr", {
        style: {
            borderColor: "var(--border)",
            ...style
        }
    }, void 0, false, {
        fileName: "[project]/draft-kit/packages/draftkit-react/src/primitives.tsx",
        lineNumber: 70,
        columnNumber: 10
    }, this);
}
}),
"[project]/draft-kit/packages/draftkit-react/src/render-draft.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "renderDraftNode",
    ()=>renderDraftNode
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$draft$2d$kit$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$0_$40$babel$2b$core$40$7$2e$29$2e$0_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/draft-kit/node_modules/.pnpm/next@16.2.0_@babel+core@7.29.0_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$draft$2d$kit$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$0_$40$babel$2b$core$40$7$2e$29$2e$0_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/draft-kit/node_modules/.pnpm/next@16.2.0_@babel+core@7.29.0_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$draft$2d$kit$2f$packages$2f$draftkit$2d$react$2f$src$2f$primitives$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/draft-kit/packages/draftkit-react/src/primitives.tsx [app-ssr] (ecmascript)");
;
;
;
function pickText(node, fallback) {
    return node.text ?? fallback;
}
function styleFromProps(node) {
    const props = node.props ?? {};
    const style = {};
    if (typeof props.gap === "number") style.gap = props.gap;
    if (typeof props.padding === "number") style.padding = props.padding;
    if (typeof props.paddingX === "number") {
        style.paddingLeft = props.paddingX;
        style.paddingRight = props.paddingX;
    }
    if (typeof props.paddingY === "number") {
        style.paddingTop = props.paddingY;
        style.paddingBottom = props.paddingY;
    }
    if (typeof props.maxWidth === "number") style.maxWidth = props.maxWidth;
    if (typeof props.columns === "number") style.gridTemplateColumns = `repeat(${props.columns}, minmax(0, 1fr))`;
    if (typeof props.background === "string") style.background = props.background;
    return style;
}
function renderChildren(node) {
    return node.children?.map((child, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$draft$2d$kit$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$0_$40$babel$2b$core$40$7$2e$29$2e$0_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$draft$2d$kit$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$0_$40$babel$2b$core$40$7$2e$29$2e$0_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].Fragment, {
            children: renderDraftNode(child)
        }, `${child.type}-${index}`, false, {
            fileName: "[project]/draft-kit/packages/draftkit-react/src/render-draft.tsx",
            lineNumber: 42,
            columnNumber: 5
        }, this));
}
function renderDraftNode(node) {
    const style = styleFromProps(node);
    switch(node.type){
        case "Page":
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$draft$2d$kit$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$0_$40$babel$2b$core$40$7$2e$29$2e$0_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$draft$2d$kit$2f$packages$2f$draftkit$2d$react$2f$src$2f$primitives$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Page"], {
                style: style,
                children: renderChildren(node)
            }, void 0, false, {
                fileName: "[project]/draft-kit/packages/draftkit-react/src/render-draft.tsx",
                lineNumber: 52,
                columnNumber: 14
            }, this);
        case "Section":
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$draft$2d$kit$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$0_$40$babel$2b$core$40$7$2e$29$2e$0_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$draft$2d$kit$2f$packages$2f$draftkit$2d$react$2f$src$2f$primitives$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Section"], {
                style: style,
                children: renderChildren(node)
            }, void 0, false, {
                fileName: "[project]/draft-kit/packages/draftkit-react/src/render-draft.tsx",
                lineNumber: 54,
                columnNumber: 14
            }, this);
        case "Container":
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$draft$2d$kit$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$0_$40$babel$2b$core$40$7$2e$29$2e$0_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$draft$2d$kit$2f$packages$2f$draftkit$2d$react$2f$src$2f$primitives$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Container"], {
                style: style,
                children: renderChildren(node)
            }, void 0, false, {
                fileName: "[project]/draft-kit/packages/draftkit-react/src/render-draft.tsx",
                lineNumber: 56,
                columnNumber: 14
            }, this);
        case "Stack":
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$draft$2d$kit$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$0_$40$babel$2b$core$40$7$2e$29$2e$0_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$draft$2d$kit$2f$packages$2f$draftkit$2d$react$2f$src$2f$primitives$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Stack"], {
                style: style,
                children: renderChildren(node)
            }, void 0, false, {
                fileName: "[project]/draft-kit/packages/draftkit-react/src/render-draft.tsx",
                lineNumber: 58,
                columnNumber: 14
            }, this);
        case "Inline":
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$draft$2d$kit$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$0_$40$babel$2b$core$40$7$2e$29$2e$0_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$draft$2d$kit$2f$packages$2f$draftkit$2d$react$2f$src$2f$primitives$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Inline"], {
                style: style,
                children: renderChildren(node)
            }, void 0, false, {
                fileName: "[project]/draft-kit/packages/draftkit-react/src/render-draft.tsx",
                lineNumber: 60,
                columnNumber: 14
            }, this);
        case "Grid":
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$draft$2d$kit$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$0_$40$babel$2b$core$40$7$2e$29$2e$0_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$draft$2d$kit$2f$packages$2f$draftkit$2d$react$2f$src$2f$primitives$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Grid"], {
                style: style,
                children: renderChildren(node)
            }, void 0, false, {
                fileName: "[project]/draft-kit/packages/draftkit-react/src/render-draft.tsx",
                lineNumber: 62,
                columnNumber: 14
            }, this);
        case "Spacer":
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$draft$2d$kit$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$0_$40$babel$2b$core$40$7$2e$29$2e$0_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$draft$2d$kit$2f$packages$2f$draftkit$2d$react$2f$src$2f$primitives$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Spacer"], {
                style: style
            }, void 0, false, {
                fileName: "[project]/draft-kit/packages/draftkit-react/src/render-draft.tsx",
                lineNumber: 64,
                columnNumber: 14
            }, this);
        case "Divider":
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$draft$2d$kit$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$0_$40$babel$2b$core$40$7$2e$29$2e$0_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$draft$2d$kit$2f$packages$2f$draftkit$2d$react$2f$src$2f$primitives$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Divider"], {
                style: style
            }, void 0, false, {
                fileName: "[project]/draft-kit/packages/draftkit-react/src/render-draft.tsx",
                lineNumber: 66,
                columnNumber: 14
            }, this);
        case "Card":
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$draft$2d$kit$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$0_$40$babel$2b$core$40$7$2e$29$2e$0_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("article", {
                style: {
                    border: "1px solid #e5e7eb",
                    borderRadius: 12,
                    padding: 12,
                    display: "grid",
                    gap: 10,
                    ...style
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$draft$2d$kit$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$0_$40$babel$2b$core$40$7$2e$29$2e$0_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                        style: {
                            display: "grid",
                            gap: 4
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$draft$2d$kit$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$0_$40$babel$2b$core$40$7$2e$29$2e$0_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                children: String(node.props?.title ?? "Card")
                            }, void 0, false, {
                                fileName: "[project]/draft-kit/packages/draftkit-react/src/render-draft.tsx",
                                lineNumber: 80,
                                columnNumber: 13
                            }, this),
                            node.props?.description ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$draft$2d$kit$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$0_$40$babel$2b$core$40$7$2e$29$2e$0_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                style: {
                                    color: "#6b7280",
                                    fontSize: 14
                                },
                                children: String(node.props.description)
                            }, void 0, false, {
                                fileName: "[project]/draft-kit/packages/draftkit-react/src/render-draft.tsx",
                                lineNumber: 82,
                                columnNumber: 15
                            }, this) : null
                        ]
                    }, void 0, true, {
                        fileName: "[project]/draft-kit/packages/draftkit-react/src/render-draft.tsx",
                        lineNumber: 79,
                        columnNumber: 11
                    }, this),
                    renderChildren(node)
                ]
            }, void 0, true, {
                fileName: "[project]/draft-kit/packages/draftkit-react/src/render-draft.tsx",
                lineNumber: 69,
                columnNumber: 9
            }, this);
        case "Button":
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$draft$2d$kit$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$0_$40$babel$2b$core$40$7$2e$29$2e$0_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                type: "button",
                style: {
                    border: "1px solid #111827",
                    borderRadius: 8,
                    padding: "8px 12px",
                    background: node.props?.variant === "outline" ? "transparent" : "#111827",
                    color: node.props?.variant === "outline" ? "#111827" : "#ffffff",
                    ...style
                },
                children: pickText(node, "Button")
            }, void 0, false, {
                fileName: "[project]/draft-kit/packages/draftkit-react/src/render-draft.tsx",
                lineNumber: 92,
                columnNumber: 9
            }, this);
        case "Badge":
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$draft$2d$kit$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$0_$40$babel$2b$core$40$7$2e$29$2e$0_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                style: {
                    display: "inline-flex",
                    width: "fit-content",
                    borderRadius: 9999,
                    fontSize: 12,
                    padding: "4px 8px",
                    background: "#e2e8f0",
                    ...style
                },
                children: pickText(node, "Badge")
            }, void 0, false, {
                fileName: "[project]/draft-kit/packages/draftkit-react/src/render-draft.tsx",
                lineNumber: 108,
                columnNumber: 9
            }, this);
        case "Input":
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$draft$2d$kit$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$0_$40$babel$2b$core$40$7$2e$29$2e$0_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                placeholder: String(node.props?.placeholder ?? ""),
                style: {
                    width: "100%",
                    border: "1px solid #d1d5db",
                    borderRadius: 8,
                    padding: "8px 10px",
                    ...style
                }
            }, void 0, false, {
                fileName: "[project]/draft-kit/packages/draftkit-react/src/render-draft.tsx",
                lineNumber: 124,
                columnNumber: 9
            }, this);
        case "Text":
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$draft$2d$kit$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$0_$40$babel$2b$core$40$7$2e$29$2e$0_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                style: {
                    margin: 0,
                    color: node.props?.tone === "muted" ? "#6b7280" : "#0f172a",
                    fontSize: node.props?.size === "xl" ? 30 : node.props?.size === "md" ? 16 : 14,
                    fontWeight: node.props?.weight === "bold" ? 700 : 400,
                    ...style
                },
                children: pickText(node, "")
            }, void 0, false, {
                fileName: "[project]/draft-kit/packages/draftkit-react/src/render-draft.tsx",
                lineNumber: 137,
                columnNumber: 9
            }, this);
        default:
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$draft$2d$kit$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$0_$40$babel$2b$core$40$7$2e$29$2e$0_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                style: {
                    color: "crimson",
                    margin: 0
                },
                children: [
                    "Unknown component: ",
                    node.type
                ]
            }, void 0, true, {
                fileName: "[project]/draft-kit/packages/draftkit-react/src/render-draft.tsx",
                lineNumber: 151,
                columnNumber: 9
            }, this);
    }
}
}),
"[project]/draft-kit/packages/draftkit-react/src/DraftKitShell.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DraftKitShell",
    ()=>DraftKitShell
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$draft$2d$kit$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$0_$40$babel$2b$core$40$7$2e$29$2e$0_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/draft-kit/node_modules/.pnpm/next@16.2.0_@babel+core@7.29.0_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$draft$2d$kit$2f$packages$2f$draftkit$2d$core$2f$src$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/draft-kit/packages/draftkit-core/src/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$draft$2d$kit$2f$packages$2f$draftkit$2d$core$2f$src$2f$mock$2d$generator$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/draft-kit/packages/draftkit-core/src/mock-generator.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$draft$2d$kit$2f$packages$2f$draftkit$2d$core$2f$src$2f$serialize$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/draft-kit/packages/draftkit-core/src/serialize.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$draft$2d$kit$2f$packages$2f$draftkit$2d$core$2f$src$2f$validate$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/draft-kit/packages/draftkit-core/src/validate.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$draft$2d$kit$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$0_$40$babel$2b$core$40$7$2e$29$2e$0_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/draft-kit/node_modules/.pnpm/next@16.2.0_@babel+core@7.29.0_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$draft$2d$kit$2f$packages$2f$draftkit$2d$react$2f$src$2f$render$2d$draft$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/draft-kit/packages/draftkit-react/src/render-draft.tsx [app-ssr] (ecmascript)");
"use client";
;
;
;
;
function DraftKitShell({ registry, onExportPng }) {
    const [prompt, setPrompt] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$draft$2d$kit$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$0_$40$babel$2b$core$40$7$2e$29$2e$0_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("landing hero 만들어줘");
    const [draft, setDraft] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$draft$2d$kit$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$0_$40$babel$2b$core$40$7$2e$29$2e$0_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [jsxCode, setJsxCode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$draft$2d$kit$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$0_$40$babel$2b$core$40$7$2e$29$2e$0_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [validationMessage, setValidationMessage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$draft$2d$kit$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$0_$40$babel$2b$core$40$7$2e$29$2e$0_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("아직 생성 전입니다.");
    const deferredPrompt = (0, __TURBOPACK__imported__module__$5b$project$5d2f$draft$2d$kit$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$0_$40$babel$2b$core$40$7$2e$29$2e$0_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useDeferredValue"])(prompt);
    function handleGenerate() {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$draft$2d$kit$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$0_$40$babel$2b$core$40$7$2e$29$2e$0_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["startTransition"])(()=>{
            const nextDraft = (0, __TURBOPACK__imported__module__$5b$project$5d2f$draft$2d$kit$2f$packages$2f$draftkit$2d$core$2f$src$2f$mock$2d$generator$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createMockDraft"])(prompt, registry);
            const validation = (0, __TURBOPACK__imported__module__$5b$project$5d2f$draft$2d$kit$2f$packages$2f$draftkit$2d$core$2f$src$2f$validate$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["validateDraft"])(nextDraft, registry);
            setDraft(nextDraft);
            setJsxCode((0, __TURBOPACK__imported__module__$5b$project$5d2f$draft$2d$kit$2f$packages$2f$draftkit$2d$core$2f$src$2f$serialize$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["serializeDraftToJsx"])(nextDraft));
            setValidationMessage(validation.ok ? "검증 통과" : `검증 실패: ${validation.issues[0]?.message ?? "알 수 없는 에러"}`);
        });
    }
    async function handleCopyCode() {
        if (!jsxCode) return;
        await navigator.clipboard.writeText(jsxCode);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$draft$2d$kit$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$0_$40$babel$2b$core$40$7$2e$29$2e$0_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        style: {
            minHeight: "100dvh",
            display: "grid",
            gridTemplateColumns: "380px 1fr",
            background: "linear-gradient(160deg, #f8fafc 0%, #eef2ff 100%)"
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$draft$2d$kit$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$0_$40$babel$2b$core$40$7$2e$29$2e$0_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("aside", {
                style: {
                    borderRight: "1px solid var(--border)",
                    padding: 16,
                    display: "grid",
                    gap: 12,
                    background: "rgba(255,255,255,0.8)",
                    backdropFilter: "blur(8px)"
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$draft$2d$kit$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$0_$40$babel$2b$core$40$7$2e$29$2e$0_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        style: {
                            fontSize: 20
                        },
                        children: "DraftKit Playground"
                    }, void 0, false, {
                        fileName: "[project]/draft-kit/packages/draftkit-react/src/DraftKitShell.tsx",
                        lineNumber: 65,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$draft$2d$kit$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$0_$40$babel$2b$core$40$7$2e$29$2e$0_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        style: {
                            color: "color-mix(in oklab, var(--foreground) 65%, #0000)"
                        },
                        children: "프롬프트를 입력하면 mock draft를 생성하고 바로 오버레이로 보여줍니다."
                    }, void 0, false, {
                        fileName: "[project]/draft-kit/packages/draftkit-react/src/DraftKitShell.tsx",
                        lineNumber: 66,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$draft$2d$kit$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$0_$40$babel$2b$core$40$7$2e$29$2e$0_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        htmlFor: "prompt",
                        children: "Prompt"
                    }, void 0, false, {
                        fileName: "[project]/draft-kit/packages/draftkit-react/src/DraftKitShell.tsx",
                        lineNumber: 69,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$draft$2d$kit$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$0_$40$babel$2b$core$40$7$2e$29$2e$0_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                        id: "prompt",
                        value: prompt,
                        onChange: (event)=>setPrompt(event.target.value),
                        style: {
                            minHeight: 110,
                            border: "1px solid var(--border)",
                            borderRadius: 10,
                            padding: 10,
                            resize: "vertical",
                            font: "inherit"
                        }
                    }, void 0, false, {
                        fileName: "[project]/draft-kit/packages/draftkit-react/src/DraftKitShell.tsx",
                        lineNumber: 70,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$draft$2d$kit$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$0_$40$babel$2b$core$40$7$2e$29$2e$0_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: "flex",
                            gap: 8,
                            flexWrap: "wrap"
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$draft$2d$kit$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$0_$40$babel$2b$core$40$7$2e$29$2e$0_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: handleGenerate,
                                children: "Generate Draft"
                            }, void 0, false, {
                                fileName: "[project]/draft-kit/packages/draftkit-react/src/DraftKitShell.tsx",
                                lineNumber: 84,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$draft$2d$kit$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$0_$40$babel$2b$core$40$7$2e$29$2e$0_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: handleCopyCode,
                                disabled: !jsxCode,
                                children: "Copy JSX"
                            }, void 0, false, {
                                fileName: "[project]/draft-kit/packages/draftkit-react/src/DraftKitShell.tsx",
                                lineNumber: 87,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$draft$2d$kit$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$0_$40$babel$2b$core$40$7$2e$29$2e$0_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: onExportPng,
                                children: "Export PNG (TODO)"
                            }, void 0, false, {
                                fileName: "[project]/draft-kit/packages/draftkit-react/src/DraftKitShell.tsx",
                                lineNumber: 90,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/draft-kit/packages/draftkit-react/src/DraftKitShell.tsx",
                        lineNumber: 83,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$draft$2d$kit$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$0_$40$babel$2b$core$40$7$2e$29$2e$0_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            border: "1px solid var(--border)",
                            borderRadius: 8,
                            padding: 10,
                            fontSize: 14
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$draft$2d$kit$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$0_$40$babel$2b$core$40$7$2e$29$2e$0_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                children: "Validation:"
                            }, void 0, false, {
                                fileName: "[project]/draft-kit/packages/draftkit-react/src/DraftKitShell.tsx",
                                lineNumber: 102,
                                columnNumber: 11
                            }, this),
                            " ",
                            validationMessage,
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$draft$2d$kit$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$0_$40$babel$2b$core$40$7$2e$29$2e$0_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                fileName: "[project]/draft-kit/packages/draftkit-react/src/DraftKitShell.tsx",
                                lineNumber: 103,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$draft$2d$kit$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$0_$40$babel$2b$core$40$7$2e$29$2e$0_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                children: "Deferred Prompt:"
                            }, void 0, false, {
                                fileName: "[project]/draft-kit/packages/draftkit-react/src/DraftKitShell.tsx",
                                lineNumber: 104,
                                columnNumber: 11
                            }, this),
                            " ",
                            deferredPrompt
                        ]
                    }, void 0, true, {
                        fileName: "[project]/draft-kit/packages/draftkit-react/src/DraftKitShell.tsx",
                        lineNumber: 94,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$draft$2d$kit$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$0_$40$babel$2b$core$40$7$2e$29$2e$0_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("pre", {
                        style: {
                            margin: 0,
                            whiteSpace: "pre-wrap",
                            border: "1px solid var(--border)",
                            borderRadius: 8,
                            padding: 10,
                            fontSize: 12,
                            maxHeight: 240,
                            overflow: "auto"
                        },
                        children: jsxCode || "// Generate를 누르면 JSX가 여기에 표시됩니다."
                    }, void 0, false, {
                        fileName: "[project]/draft-kit/packages/draftkit-react/src/DraftKitShell.tsx",
                        lineNumber: 106,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/draft-kit/packages/draftkit-react/src/DraftKitShell.tsx",
                lineNumber: 55,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$draft$2d$kit$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$0_$40$babel$2b$core$40$7$2e$29$2e$0_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                "aria-label": "overlay preview",
                style: {
                    position: "relative",
                    padding: 24,
                    overflow: "hidden"
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$draft$2d$kit$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$0_$40$babel$2b$core$40$7$2e$29$2e$0_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            position: "absolute",
                            inset: 24,
                            borderRadius: 16,
                            border: "1px dashed color-mix(in oklab, var(--foreground) 20%, #0000)",
                            background: "repeating-linear-gradient(45deg, #ffffff 0 16px, #f8fafc 16px 32px)"
                        }
                    }, void 0, false, {
                        fileName: "[project]/draft-kit/packages/draftkit-react/src/DraftKitShell.tsx",
                        lineNumber: 126,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$draft$2d$kit$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$0_$40$babel$2b$core$40$7$2e$29$2e$0_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            position: "absolute",
                            inset: 40,
                            borderRadius: 16,
                            border: "1px solid var(--border)",
                            background: "white",
                            overflow: "auto",
                            padding: 16
                        },
                        children: draft ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$draft$2d$kit$2f$packages$2f$draftkit$2d$react$2f$src$2f$render$2d$draft$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["renderDraftNode"])(draft) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$draft$2d$kit$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$0_$40$babel$2b$core$40$7$2e$29$2e$0_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            style: {
                                color: "#6b7280"
                            },
                            children: "아직 draft가 없습니다. 왼쪽에서 Generate Draft를 눌러주세요."
                        }, void 0, false, {
                            fileName: "[project]/draft-kit/packages/draftkit-react/src/DraftKitShell.tsx",
                            lineNumber: 150,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/draft-kit/packages/draftkit-react/src/DraftKitShell.tsx",
                        lineNumber: 136,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/draft-kit/packages/draftkit-react/src/DraftKitShell.tsx",
                lineNumber: 122,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/draft-kit/packages/draftkit-react/src/DraftKitShell.tsx",
        lineNumber: 47,
        columnNumber: 5
    }, this);
}
}),
"[project]/draft-kit/packages/draftkit-react/src/index.ts [app-ssr] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$draft$2d$kit$2f$packages$2f$draftkit$2d$react$2f$src$2f$DraftKitShell$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/draft-kit/packages/draftkit-react/src/DraftKitShell.tsx [app-ssr] (ecmascript)");
;
}),
"[project]/draft-kit/examples/playground-next/src/app/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Page
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$draft$2d$kit$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$0_$40$babel$2b$core$40$7$2e$29$2e$0_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/draft-kit/node_modules/.pnpm/next@16.2.0_@babel+core@7.29.0_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$draft$2d$kit$2f$packages$2f$draftkit$2d$core$2f$src$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/draft-kit/packages/draftkit-core/src/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$draft$2d$kit$2f$packages$2f$draftkit$2d$core$2f$src$2f$layout$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/draft-kit/packages/draftkit-core/src/layout.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$draft$2d$kit$2f$packages$2f$draftkit$2d$react$2f$src$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/draft-kit/packages/draftkit-react/src/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$draft$2d$kit$2f$packages$2f$draftkit$2d$react$2f$src$2f$DraftKitShell$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/draft-kit/packages/draftkit-react/src/DraftKitShell.tsx [app-ssr] (ecmascript)");
"use client";
;
;
;
function Page() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$draft$2d$kit$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$0_$40$babel$2b$core$40$7$2e$29$2e$0_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$draft$2d$kit$2f$packages$2f$draftkit$2d$react$2f$src$2f$DraftKitShell$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DraftKitShell"], {
        registry: __TURBOPACK__imported__module__$5b$project$5d2f$draft$2d$kit$2f$packages$2f$draftkit$2d$core$2f$src$2f$layout$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["defaultRegistry"],
        onExportPng: ()=>{
            // MVP skeleton: PNG export pipeline will be added next.
            window.alert("PNG export는 다음 단계에서 연결합니다.");
        }
    }, void 0, false, {
        fileName: "[project]/draft-kit/examples/playground-next/src/app/page.tsx",
        lineNumber: 8,
        columnNumber: 5
    }, this);
}
}),
"[project]/draft-kit/node_modules/.pnpm/next@16.2.0_@babel+core@7.29.0_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

module.exports = __turbopack_context__.r("[project]/draft-kit/node_modules/.pnpm/next@16.2.0_@babel+core@7.29.0_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/next/dist/server/route-modules/app-page/module.compiled.js [app-ssr] (ecmascript)").vendored['react-ssr'].ReactJsxDevRuntime;
}),
];

//# sourceMappingURL=draft-kit_05rx9.2._.js.map
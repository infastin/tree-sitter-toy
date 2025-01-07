// swift-tools-version:5.3
import PackageDescription

let package = Package(
    name: "TreeSitterToy",
    products: [
        .library(name: "TreeSitterToy", targets: ["TreeSitterToy"]),
    ],
    dependencies: [
        .package(url: "https://github.com/ChimeHQ/SwiftTreeSitter", from: "0.8.0"),
    ],
    targets: [
        .target(
            name: "TreeSitterToy",
            dependencies: [],
            path: ".",
            sources: [
                "src/parser.c",
                // NOTE: if your language has an external scanner, add it here.
            ],
            resources: [
                .copy("queries")
            ],
            publicHeadersPath: "bindings/swift",
            cSettings: [.headerSearchPath("src")]
        ),
        .testTarget(
            name: "TreeSitterToyTests",
            dependencies: [
                "SwiftTreeSitter",
                "TreeSitterToy",
            ],
            path: "bindings/swift/TreeSitterToyTests"
        )
    ],
    cLanguageStandard: .c11
)

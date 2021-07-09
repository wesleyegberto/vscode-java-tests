# Change Log

All notable changes to this project will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [1.4.0] - 2021-07-09

### Added

- Snippets for Maven:
  - JaCoCo plugin
  - ArchUnit dependency
  - JsonPath dependency

### Bugfix

- normalize file path when generating package name (PR #3 from @baincd)

## [1.3.0] - 2021-04-13

### Added

- Started support for JUnit 5:
  - imports
  - pom.xml dependencies
  - added snippets to specific JUnit 5 tests
- Configuration `javaTests.template.junitDefaultVersion` to define the JUnit version

## [1.2.1] - 2020-12-11

### Added

- Simple icon

## [1.2.0] - 2020-11-15

### Added

- Created option to define the test class structure:
  - if should mock constructor's parameters
  - if should create test case for each method
  - if should ignore static method when creating test case

## [1.1.0] - 2020-09-08

### Added

- Command and context menu to generate or open a class using its qualified name

### Changed

- Fixed field name generated in test class for generic type
- Command title prefix from `Java Test:` to `Java:`

## [1.0.1] - 2020-09-08

### Added

- Tests

### Changed

- Fixed test class generated for generic type

## [1.0.0] - 2020-09-03

### Added

- Added lib `java-ast` version 0.3.0
- Generate the mocked arguments to constructor
- Generate a test case for each public method
- Declare variables used in test case (arguments and result)

## [0.2.1] - 2020-09-02

### Changed

- Moved snippets file to root

## [0.2.0] - 2020-08-31

### Changed

- Display name to `Java Tests`

### Added

- Snippets to write imports, assertions and mocks

## [0.1.0] - 2020-08-22

### Changed

- Changed the command to `java.tests.createTestClass`.
- Display name to `VSCode Java Tests`.

### Added

- Menu option on Explorer view when over a Java file.
- Configuration `javaTests.file.openLocation` to define where to open the test file.

### Added

- Generate a test class with code to construct the source class

## [Unreleased]

- Initial release

# VSCode Java Tests

[![github-license-badge]][github-license]
[![github-badge]][github]

Extension to help write tests in Java using JUnit 4/5 with Hamcrest and Mockito.

Features:

* Snippets to add dependencies/plugins of test libs:
  * JUnit 5 and Vintage
  * [JsonPath](https://github.com/json-path/JsonPath): Java DSL to facilitate the creation of JSON matchers
  * [ArchUnit](https://github.com/TNG/ArchUnit): Java DSL to test project architecture
  * [JaCoCo](https://www.jacoco.org/jacoco/): Code coverage report
  * [Pitest](https://github.com/hcoles/pitest): Mutation test
  * [Testcontainers](https://www.testcontainers.org/)
* Snippets to write tests structures, assertions, mocks, so on
* Generate/open a test class for a given class
* Generate/open a class using its qualified name (like IntelliJ IDEA)

It generates the test class with configuration to run with JUnit 4 or 5 (depending on the option `javaTests.template.junitDefaultVersion` in VS Code).

I also recommend install Microsoft's [Java Test Runner](https://marketplace.visualstudio.com/items?itemName=vscjava.vscode-java-test)

## How to Use

### Commands

| Command | Action | Description |
| - | - | - |
| `java.tests.createTestClass` | `Create/Open Test File` | Generate or open a test class |
| `java.tests.createNewClass` | `Create new class` | Generate or open a class from its qualified name |

### Snippets

#### Java

| Prefix | Description |
| - | - |
| `imports_junit4` | Insert the imports for JUnit 4 (Mockito, Hamcrast and JUnit) |
| `imports_junit5` | Insert the imports for JUnit 5 (Mockito, Hamcrast and JUnit) |
| `test_before` | Create setup method with `@Before` |
| `test_after` | Create tear down method with `@After` |
| `test_equals` | `assertEquals` |
| `test_is` | `assertThat` with `is` |
| `test_null` | `assertThat` with `nullValue` |
| `test_not_null` | `assertThat` with `notNullValue` |
| `test_nullorempty` | `assertThat` with `emptyOrNullString` |
| `test_not_nullorempty` | `assertThat` with `not(emptyOrNullString)` |
| `test_isOneOf` | `assertThat` with `isOneOf` |
| `test_hasSize` | `assertThat` with `hasSize` |
| `test_hasItem` | `assertThat` with `hasItem` |
| `test_hasItems` | `assertThat` with `hasItems` |
| `test_isIn` | `assertThat` with `isIn` |
| `mock_class` | Create a mock object of a class |
| `mock_method_return` | Mock a method's return |
| `mock_method_throw` | Mock a method to throw exception |
| `mock_verify_only` | Verify if a mocked method was the only one called |
| `mock_verify_once` | Verify if a mocked method was called only once |
| `mock_verify_times` | Verify if a mocked method was called `n` times |
| `mock_verify_never` | Verify if a mocked method was never called |
| `mock_arg_capture` | Capture an argument given to a mocked method using `ArgumentCaptor` |
| `test_exception` | Assertion to verify if an exception was thrown (only JUnit 5) |
| `test_parameterized` | Create a parameterized test (only JUnit 5) |

#### POM.xml

Snippets for Maven.

##### Dependencies

| Prefix | Description |
| - | - |
| `junit5-props` | JUnit 5 verson properties |
| `junit5-deps` | JUnit 5 dependencies |
| `junit5-vintage` | JUnit 5 Vintage dependency to run tests from JUnit 3/4 |
| `archunit-junit5-dep` | ArchUnit dependency to run with Junit 5 |
| `jsonpath-dep` | JsonPath dependency to facilitate the creation of matchers for JSON |
| `testcontainers-dep` | Testcontainer dependencies |
| `testcontainers-dep-management` | Testcontainers Maven dependecy management |

##### Plugins

| Prefix | Description |
| - | - |
| `plugin-surefire` | Surefire |
| `plugin-failsafe` | Failsafe |
| `plugin-jacoco` | JaCoCo Code Coverage Library |
| `plugin-pitest` | Mutation test with Pitest |

## Actions

### Create Test File

Generate a test class in the folder `src/test/java` with code to construct the source class, if already there is a test
class then it will be opened.

Generate the test class with the following structure:

* All the types that are used by target Java class are imported (improvements pending)
* Define the instance to test using its **first** non-private constructor
* Define an attribute annotated with `@Mock` for each parameter from the **first** non-private constructor
* Define a test case for each public method that is not a setter (start with `set` and has only one parameter)
* Declare the variables to be passed as argument to the public method and to store the result, if needed

#### Example in JUnit 4

Given the file `/src/main/java/com/github/sample/ObjectService.java`:

```java
package com.github.sample;

import java.util.logging.Logger;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;
import org.springframework.stereotype.Service;

@Service
public class ObjectService {
    private Logger logger;
    private ObjectRepository repository;

    private ObjectService(ObjectRepository repository) {
        this.repository = repository;
    }

    ObjectService(Logger logger, ObjectRepository repository) {
        this.logger = logger;
        this.repository = repository;
    }

    public void setLogger(Logger logger) {
        this.logger = logger;
    }

    public void save(Object object) {
        this.repository.save(object);
    }

    public Iterable<Object> fetchObjects() {
        return this.repository.findAll();
    }

    public Object findById(long id) {
        return this.repository.findById(id);
    }
}

@Repository

interface ObjectRepository extends CrudRepository<Object, Long> {
}

```

Generate the test file `/src/test/java/com/github/sample/ObjectService.java`:

```java
package com.github.sample;

import static org.hamcrest.Matchers.*;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertThat;
import static org.mockito.Mockito.*;
import org.hamcrest.CoreMatchers;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;

// To be improved: only import the types that are used in the class API
import java.util.logging.Logger;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;
import org.springframework.stereotype.Service;

public class ObjectServiceTest {
    @Mock
    private Logger logger;
    @Mock
    private ObjectRepository repository;

    private ObjectService objectService;

    @Before
    public void setup() {
        this.objectService = new ObjectService(logger, repository);
    }

    @Test
    public void shouldSave() {
        // TODO: initialize args
        Object object;

        objectService.save(object);

        // TODO: assert scenario
    }

    @Test
    public void shouldFetchObjects() {
        Iterable<Object> actualValue = objectService.fetchObjects();

        // TODO: assert scenario
    }

    @Test
    public void shouldFindById() {
        // TODO: initialize args
        long id;

        Object actualValue = objectService.findById(id);

        // TODO: assert scenario
    }
}
```

### Create New Class

Generate or open a class inside the folder `src/main/java` from a qualified class name (like IntelliJ IDEA).

#### Example

Give the input `com.github.sample.ObjectService`

Will generate a file `/src/main/java/com/github/sample/ObjectService.java` with the following content:

```java
package com.github.sample;

public class ObjectService {

}
```

## Known Bugs

- [ ] The generated test class tries to create a new instance even when there is only one private constructor

## Roadmap

- [x] Snippets to test
- [x] Generate a test case for each method
- [x] Create option to define if should mock the constructor's parameters
- [x] Create option to define if should create a test case for each method
- [x] Create option to ignore the static methods
- [x] Generate template for JUnit 5 (imports, tests, checkers)
- [x] Auto import the types used in arguments to constructor and methods
  - [ ] Improve to *only* import the types used in arguments to constructor and methods
- [ ] Snippets for Spring Boot tests (Rest Controller, Repository) - Doing
- [ ] Remember JUnit version by project
- [ ] Command to create the target class in `src/main/java` when doing TDD
- [ ] Create tests for the extension

## Links

- [Github Repository](https://github.com/wesleyegberto/vscode-java-tests)
- [JUnit 5 Docs](https://junit.org/junit5/docs/current/user-guide/)

[github-license]: https://github.com/wesleyegberto/vscode-java-tests/blob/master/LICENSE
[github-license-badge]: https://img.shields.io/github/license/wesleyegberto/vscode-java-tests.svg?style=flat "License"
[github]: https://github.com/wesleyegberto/vscode-java-tests/actions?query=branch%3Amaster
[github-badge]: https://github.com/wesleyegberto/vscode-java-tests/actions/workflows/ci.yml/badge.svg?branch=master
[github-history-badge]: https://buildstats.info/github/chart/wesleyegberto/vscode-java-tests?includeBuildsFromPullRequest=false "GitHub Actions History"

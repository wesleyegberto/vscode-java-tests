# VSCode Java Tests

Extension to help write tests in Java using JUnit and Mockito.

Features:

* Snippets to write tests
* Generate or open a test class for a given class

## How to Use

### Commands

| Command | Action | Description |
| - | - | - |
| `java.tests.createTestClass` | `Create/Open Test File` | Generate or open a test class |

### Snippets

| Prefix | Description |
| - | - |
| `imports_test` | Insert the imports for testing (Mockito, Hamcrast and JUnit) |
| `test_before` | Create setup method with `@Before` |
| `test_after` | Create tear down method with `@After` |
| `test_is` | `assertThat` with `is` |
| `test_equals` | `assertEquals` |
| `test_isOneOf` | `assertThat` with `isOneOf` |
| `test_hasSize` | `assertThat` with `hasSize` |
| `test_hasItem` | `assertThat` with `hasItem` |
| `test_hasItems` | `assertThat` with `hasItems` |
| `test_isIn` | `assertThat` with `isIn` |
| `mock_class` | Create a mock object of a class |
| `mock_method_return` | Mock a method's return |
| `mock_method_throw` | Mock a method to throw exception |
| `mock_verify_times` | Verify if a mocked method was called `n` times |
| `mock_verify_never` | Verify if a mocked method was never called |
| `mock_arg_capture` | Capture an argument given to a mocked method using `ArgumentCaptor` |

## Actions

### Create Test File

Generate a test class in the folder `src/test/java` with code to construct the source class, if already there is a test
class then it will be opened.

Generate the test class with the following structure:

* The types that are used by Java class is **NOT** imported by default (to be implemented)
* Define the instance to test using its **first** non-private constructor
* Define an attribute annotated with `@Mock` for each parameter from the **first** non-private constructor
* Define a test case for each public method that is not a setter (start with `set` and has only one parameter)
* Declare the variables to be passed as argument to the public method and to store the result, if needed

Example:

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

public class ObjectServiceTest {
    @Mock
    private Logger logger; // won't be imported automatically
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

## Known Bugs

- [x] Generic type isn't correctly parsed (`TypedClass<T>` -> `TypedClass`)

## Roadmap

- [x] Snippets to test
- [x] Generate a test case for each method
- [ ] Create option to define if should mock the constructor's parameters
- [ ] Create option to define if should create a test case for each method
- [ ] Create option to ignore the static methods
- [ ] Auto import the types used in arguments to constructor and methods
- [ ] Command to create the target class in `src/main/java` when doing TDD
- [ ] Create tests for the extension

## Links

- [Github Repository](https://github.com/wesleyegberto/vscode-java-tests)

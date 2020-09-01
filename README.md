# VSCode Java Tests

Extension to help write tests in Java using JUnit and Mockito.

Features:

* Generate or open a test class for a given class
* Snippets to write tests

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

Example:

Given the file `/src/main/java/com/github/sample/MessageService.java`:

```java
package com.github.sample;

public class MessageService {
	public String getMessage() {
		return "Hello World!";
	}
}
```

Generate the test file `/src/test/java/com/github/sample/MessageServiceTest.java`:

```java
package com.github.sample;

import static org.hamcrest.CoreMatchers.*;
import org.hamcrest.CustomMatcher;
import org.hamcrest.Matcher;
import static org.junit.Assert.assertThat;
import org.junit.Before;
import org.junit.Test;

import com.github.sample.MessageService;

public class MessageServiceTest {
	private MessageService cut;

	@Before
	public void setup() {
		this.cut = new MessageService();
	}

	@Test
	public void shouldCompile() {
		assertThat("Actual value", is("Expected value"));
	}
}

```

## Todos

- [x] Snippets to test
- [ ] Create tests for the extension
- [ ] Generate a test case for each method
- [ ] Command to create the target class in `src/main/java` when doing TDD

## Links

- [Github Repository](https://github.com/wesleyegberto/vscode-java-tests)
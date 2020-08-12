# VSCode Java Tests

Extension to help write Java tests.

## How to Use

| Command | Action | Description |
| - | - | - |
| `vscode-java-tests.createTestClass` | `Create Test File` | Generate a test class |

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

- [ ] Create tests for the extension
- [ ] Generate a test case for each method
- [ ] Command to create the target class in `src/main/java` when doing TDD

## Links

- [Github Repository](https://github.com/wesleyegberto/vscode-java-tests)
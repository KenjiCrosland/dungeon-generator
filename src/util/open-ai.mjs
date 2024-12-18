export async function generateGptResponse(
  prompt,
  validateJSONKeys = null,
  maxAttempts = 3,
  previousContext,
) {
  let attempts = 0;
  let validJson = false;
  let errorThrown = false;
  let previousJSONString = '';
  let retryPrompt;
  let responseData;
  let validJsonString;

  while (attempts < maxAttempts && !validJson && !errorThrown) {
    try {
      if (previousJSONString) {
        retryPrompt = `This JSON may not be formatted correctly. If not formatted correctly can you fix it for me? Please only return a valid JSON string and no comments please.
                ${previousJSONString}`;
      }
      const body = {
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an assistant Game Master.' },
          { role: 'user', content: retryPrompt ? retryPrompt : prompt },
        ],
      };
      if (previousContext) {
        body.messages = [
          { role: 'system', content: 'You are an assistant Game Master.' },
          ...previousContext,
          { role: 'user', content: retryPrompt ? retryPrompt : prompt },
        ];
      }
      const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      };
      let response;
      if (import.meta.env.DEV) {
        requestOptions.headers.Authorization = `Bearer ${
          import.meta.env.VITE_OPENAI_API_KEY
        }`;
        response = await fetch(
          'https://api.openai.com/v1/chat/completions',
          requestOptions,
        );
      } else {
        response = await fetch(
          '/wp-json/open-ai-proxy/api/v1/proxy',
          requestOptions,
        );
      }
      responseData = await response.json();
      const responseContent = responseData.choices[0].message.content;
      if (!validateJSONKeys) {
        return responseContent;
      }
      //console.log(responseData.choices[0].message.content);
      validJsonString = extractJSONFromString(
        responseData.choices[0].message.content,
      );
      //console.log("valid: " + validJsonString);
      if (!validJsonString) {
        //console.log(previousJSONString);
        previousJSONString = responseContent;
        attempts++;
        continue;
      }

      if (validateJSONKeys) {
        validJson = validateJSONKeys(validJsonString);
      } else {
        validJson = true;
      }
    } catch (error) {
      console.error('Error generating response:', error);
      errorThrown = true;
    }
    attempts++;
  }

  if (!validJson) {
    throw new Error(
      'Failed to generate a valid response. Please try again later.',
    );
  }

  return validJsonString;
}

function isValidJson(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}

function extractJSONFromString(input) {
  const regex =
    /(?:\{(?:[^{}]|(?:\{(?:[^{}]|(?:\{[^{}]*\}))*\}))*\})|(?:\[(?:[^\[\]]|\[(?:[^\[\]]|\[(?:[^\[\]]|\[[^\[\]]*\])*\])*\])*\])/g;
  const matches = input.match(regex);

  function fixInvalidJSON(jsonString) {
    try {
      JSON.parse(jsonString);
    } catch (e) {
      if (e instanceof SyntaxError) {
        // Try fixing the JSON by removing the extra comma before the closing brace
        jsonString = jsonString.replace(/,\s*}/g, '}');
        jsonString = jsonString.replace(/,\s*]/g, ']');

        // Try parsing the fixed JSON string
        try {
          return JSON.parse(jsonString);
        } catch (e) {
          // If it's still not valid, return false
          return false;
        }
      } else {
        return false;
      }
    }

    return JSON.parse(jsonString);
  }

  if (matches && matches.length > 0) {
    for (const match of matches) {
      const fixedJSON = fixInvalidJSON(match);
      if (fixedJSON) {
        return JSON.stringify(fixedJSON);
      }
    }
  }

  return false;
}

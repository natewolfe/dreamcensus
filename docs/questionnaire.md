# The Dream Census v1.2

## Welcome screens
- **Hello Dreamer,
Tell us about your dreams...**: 

## Questions
1. ***The Dream Census* was created to explore our collective relationship with dreams to develop a more communal, informed dream life. There are no right or wrong answers, and everyone can participate.** (`statement`)
   - Description: (Takes approx. 10 minutes)

2. **Before we get started...** (`legal`)
   - Description: The Dream Census aggregates the anonymous data we collect and share it in the form of open data, data visualizations and creative content. We will not share any identifying information from your survey.

_*By filling out the census,*_ _you agree to grant The Dream Census license to interpret and share this anonymous information in whatever format until the sun burns out._
   - Validations:
     - required: True

3. ***Where are you?* (Event, City, etc)** (`short_text`)
   - Validations:
     - required: True

4. ***What's your email address?* (Optional)** (`email`)
   - Description: If you choose to enter your email, it will be kept private and separate from the anonymized data—we'll just use it to let you know when there is new Dream Census content and or surveys.
   - Validations:
     - required: False

5. **Section 1. The Dreamer** (`group`)
   - Description: _Tell us a little bit about yourself..._

6. **Section 2. Sleeping** (`group`)
   - Description: Tell us a bit about your sleeping habits...

7. **Section 3. Dreaming** (`group`)
   - Description: Tell us about your dreams...

8. **How would you rate this version (v1.2) of The Dream Census?** (`rating`)
   - Description: The goal of The Dream Census is to both encourage reflection on dreams in the individual taking the survey and to create a common frame of reference for our collective dream lives. How'd we do?
   - Validations:
     - required: False

9. **What would you add, remove or alter in The Dream Census?** (`long_text`)
   - Description: Take a moment to let us know what you think we could do to improve The Dream Census in the future.
   - Validations:
     - required: False
     - max_length: 800

## Thank you screens
- **And that's it. You're done!**: Thank you for participating in the Dream Census! Follow us on social media to stay informed about how this data is being turned into art.
- **Thanks for completing this typeform
Now *create your own* — it's free, easy, & beautiful**:

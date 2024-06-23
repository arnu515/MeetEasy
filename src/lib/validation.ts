import * as v from "valibot"

export const phoneNumberSchema = v.pipe(
	v.string('Please enter a phone number'),
  v.trim(),
	v.transform(x => x.replaceAll(' ', '')), // remove all spaces in the string
	v.nonEmpty('Please enter a phone number'),
	v.maxLength(24, 'Number cannot exceed 24 chars'),
	v.minLength(5, 'Number must be atleast 5 characters long.'),
	v.regex(
		/^\+[1-9]\d{1,14}$/,
		'Phone number can only contain digits, and must start with the country code (with a +)'
	) // from https://www.twilio.com/docs/glossary/what-e164
)

export const emailSchema = v.pipe(
	v.string('Please enter an email'),
	v.trim(),
	v.nonEmpty('Please enter an email'),
	v.email('Please enter an email'),
	v.maxLength(128)
)

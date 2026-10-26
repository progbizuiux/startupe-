# Startup E+ — API reference

> ## ⚠ Out of date — the Grand Launch is over
>
> `POST /api/register/start` **has been removed**, along with the `/register`
> page it served. That form existed for the Grand Launch registration; the event
> has ended.
>
> Still live and unchanged:
>
> - `POST /api/register` — the two detailed portals (`portal: "aspirant"` or
>   `"beginner"`), reached from `/register/aspirant` and `/register/beginner`
> - `POST /api/contact`
> - `GET /api/health`
>
> The `registerStart` CRM mapper and the `Startup E+ - Registration`
> `formName` are gone too, so no new leads will carry that form name or the
> `Event: Grand Launch` marker. Leads already filed are untouched.
>
> Everything below describing `/api/register/start` — its request body, its
> `registrationId` response, the Grand Launch `Event` tag on the CRM lead — no
> longer applies. The rest of the document is still accurate.

---

Four routes, all under `src/app/api/`. They exist to serve this site's own
forms, not as a public API: every one of them files a lead into the Progbiz CRM
and answers with the outcome. Nothing is stored locally, so nothing can be read
back — there is no `GET` for a registration. The registration ID in the
response is the only copy that outlives the request.

Base URL is the site itself (`https://startupeplus.com`, or
`http://localhost:3000` in development).

---

## Rules that apply to every POST

**Origin.** If the request carries an `Origin` header that does not match
`siteConfig.url`, it is rejected with `403 {"ok":false,"error":"Bad origin"}`.
A request with **no** `Origin` header passes — that is how `curl` and
server-to-server callers reach it. This is a same-origin guard against another
website posting as a visitor, not authentication. There is no API key.

**Content type.** `Content-Type: application/json`. A body that is not valid
JSON gets `400 {"ok":false,"error":"Malformed request body"}`.

**Honeypot.** Every form carries a hidden `website` field. If it arrives with
any value the submission is dropped and the route answers `201` as though it
worked — a bot must not learn which field gave it away. Leave it absent or `""`.

**Rate limit.** Per IP, held in the server's memory (so it resets on redeploy
and is per instance). Over the limit returns `429`.

**Validation failures** all share one shape, with one message per field:

```json
{ "ok": false, "errors": { "phone": "Enter a valid 10-digit number" } }
```

**CRM failures** return `502`. The lead was not filed, and the caller should
retry. In non-production the body also carries `crmStatus` and `crmError`.

---

## POST `/api/register/start`

The main registration. Mints a registration ID, files the CRM lead, and emails
a confirmation to the registrant.

Body cap 8 KB · rate limit **4 per 10 minutes** · `maxDuration` 30s.

### Request

```json
{
  "fullName": "Nithya Raj",
  "age": "22",
  "occupation": "student",
  "email": "nithya@example.com",
  "phone": "98765 43210",
  "altPhone": "",
  "address": "12/4 Mango Lane, Vadakara",
  "district": "Kozhikode",
  "website": ""
}
```

| Field        | Required | Rules                                                                                                                                                                                                                      |
| ------------ | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `fullName`   | yes      | 2–120 chars after collapsing whitespace. Any alphabet — Malayalam included. Newlines and control characters are folded to spaces before the length check, so a name cannot forge an extra labelled line in the CRM record. |
| `age`        | yes      | Integer 14–99. Sent as a string or a number; `""` reads as missing.                                                                                                                                                        |
| `occupation` | yes      | `"student"` \| `"entrepreneur"` \| `"business"`                                                                                                                                                                            |
| `email`      | yes      | Valid email. The confirmation is sent here.                                                                                                                                                                                |
| `phone`      | yes      | 10-digit Indian mobile starting 6–9. Spaces, dashes and brackets are stripped first, and an optional `+91` / `91` / `0` prefix is allowed — so `98765 43210`, `+91 98765 43210` and `09876543210` are all accepted.        |
| `altPhone`   | no       | Same rule, or `""`.                                                                                                                                                                                                        |
| `address`    | yes      | 6–240 chars after collapsing whitespace. Newlines are folded to spaces.                                                                                                                                                    |
| `district`   | yes      | One of the 14 Kerala districts (see below).                                                                                                                                                                                |
| `website`    | no       | Honeypot — must be empty or absent.                                                                                                                                                                                        |

`occupation` decides the follow-on portal: `student` → The Aspirant
(`/register/aspirant`); `entrepreneur` and `business` → The Beginner
(`/register/beginner`).

### Response — success

```json
{
  "ok": true,
  "registrationId": "SEP-FP4HW-CB88M",
  "pathway": "The Aspirant",
  "next": "/register/aspirant"
}
```

`201`, `Content-Type: application/json`, `Cache-Control: no-store` — the body
carries a personal registration ID, so nothing about it belongs in a shared
cache.

The registration ID is `SEP-XXXXX-XXXXY` in Crockford base32, the last
character a position-weighted check character — so a mistyped or transposed ID
can be rejected without a lookup.

> **Changed.** This endpoint used to answer with a PDF entry pass as the
> response body, with the details in `X-Registration-*` headers. The pass has
> been removed: it now answers with JSON on both success and failure, and there
> is no document to download. Callers that branched on `Content-Type` can stop.

### Response — failures

| Status | Body                                                                               | When                                                                                                                                                                                          |
| ------ | ---------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `400`  | `{"ok":false,"error":"Malformed request body"}`                                    | not JSON                                                                                                                                                                                      |
| `403`  | `{"ok":false,"error":"Bad origin"}`                                                | cross-origin                                                                                                                                                                                  |
| `413`  | `{"ok":false,"error":"Request too large"}`                                         | body over 8 KB                                                                                                                                                                                |
| `422`  | `{"ok":false,"errors":{…}}`                                                        | validation                                                                                                                                                                                    |
| `429`  | `{"ok":false,"error":"Too many registrations from here. Please try again later."}` | over 4 in 10 min                                                                                                                                                                              |
| `500`  | `{"ok":false,"error":"Registrations are not being accepted right now"}`            | CRM env vars missing in production                                                                                                                                                            |
| `502`  | `{"ok":false,"error":"Could not complete your registration. Please try again."}`   | CRM rejected or timed out. **No ID is returned** — handing one back for a registration that was not recorded would be a reference to something that did not happen. A retry mints a fresh ID. |

A honeypot hit returns `201` with no ID:
`{"ok":true,"registrationId":null}`.

### Order of operations

Deliberate, and worth preserving: guards → validate → mint ID → file the CRM
lead → queue the email. The ID is minted before the CRM call and returned only
after it succeeds, so a caller never holds a reference to a registration that
was not filed.

The confirmation email is queued with `after()`, so it goes out once the
response has been written — the visitor already has their registration ID, and
nothing about their registration waits on the mail provider. A failure there is
logged and goes no further.

### Example

```bash
curl -s -X POST https://startupeplus.com/api/register/start \n  -H "Content-Type: application/json" \n  -d '{
    "fullName": "Nithya Raj",
    "age": "22",
    "occupation": "student",
    "email": "nithya@example.com",
    "phone": "98765 43210",
    "altPhone": "",
    "address": "12/4 Mango Lane, Vadakara",
    "district": "Kozhikode",
    "website": ""
  }'
```

---

## POST `/api/register`

The two detailed portals. One route, two schemas — `portal` selects which.

### Request — `portal: "aspirant"`

```json
{
  "portal": "aspirant",
  "fullName": "Nithya Raj",
  "age": 22,
  "gender": "Female",
  "district": "Kozhikode",
  "whatsapp": "9876543210",
  "email": "nithya@example.com",
  "academicStatus": "College student",
  "institution": "Govt. College Vadakara",
  "pitchSummary": "A short written pitch, 150 words or fewer.",
  "pitchVideoUrl": "",
  "sector": "Agriculture / Food Processing",
  "primaryNeed": "Idea Validation",
  "ipAcknowledged": true
}
```

Two rules no single field expresses:

- `institution` is **required** when `academicStatus` is `"School student"` or
  `"College student"`.
- **At least one** of `pitchSummary` (≤150 words) or `pitchVideoUrl` (a full URL)
  must be present. The error is reported on `pitchSummary`.
- `ipAcknowledged` must be exactly `true` — the portal takes IP, so the NDA
  acknowledgement is a hard gate.
- `whatsapp` here is the stricter original pattern: it tolerates a `+91`/`0`
  prefix but **not** spaces between the digit groups, unlike `/register/start`.

### Request — `portal: "beginner"`

```json
{
  "portal": "beginner",
  "founders": [
    {
      "name": "Arun P",
      "email": "arun@example.com",
      "phone": "9876543210",
      "background": "A line or two on education or work history."
    }
  ],
  "legalName": "Example Foods Pvt Ltd",
  "registrationType": "Private Limited (Pvt Ltd)",
  "udyamNumber": "UDYAM-KL-00-0000000",
  "incorporationDate": "2024-06-01",
  "currentStage": "MVP Ready",
  "fundingHistory": ["Bootstrapped"],
  "operationalHurdle": "Customer Acquisition",
  "ipAcknowledged": true
}
```

- `founders` — 1 to 5. Each needs `name`, `email`, `phone`, and a `background`
  of 10–600 chars.
- `udyamNumber` — optional, `UDYAM-XX-00-0000000` when present.
- `incorporationDate` — any parseable date, not in the future, not before 1900.
- `fundingHistory` — array, at least one entry (`"Bootstrapped"` counts).

### Response

`201 {"ok":true}` on success. No ID, no document — these portals file a lead and
nothing else.

`400 {"ok":false,"error":"Unknown portal"}` if `portal` is not `aspirant` or
`beginner`. Otherwise `422` / `502` as above.

---

## POST `/api/contact`

Body cap 16 KB · rate limit **5 per 10 minutes**.

### Request

```json
{
  "fullName": "Nithya Raj",
  "email": "nithya@example.com",
  "phone": "9876543210",
  "topic": "Help with registering",
  "organisation": "",
  "preferredReply": "Email",
  "message": "At least twenty characters, up to twelve hundred.",
  "website": ""
}
```

| Field            | Required    | Rules                                                                                                                      |
| ---------------- | ----------- | -------------------------------------------------------------------------------------------------------------------------- |
| `fullName`       | yes         | 2–120                                                                                                                      |
| `email`          | yes         | valid email                                                                                                                |
| `phone`          | conditional | **Required** when `preferredReply` is `"Phone call"` or `"WhatsApp"`; otherwise optional. 10-digit Indian mobile, or `""`. |
| `topic`          | yes         | one of the topics below                                                                                                    |
| `organisation`   | no          | ≤160, or `""`                                                                                                              |
| `preferredReply` | yes         | `"Email"` \| `"Phone call"` \| `"WhatsApp"` — WhatsApp is only offered while `siteConfig.contact.whatsapp` is set          |
| `message`        | yes         | 20–1200                                                                                                                    |
| `website`        | no          | honeypot                                                                                                                   |

### Response

`201 {"ok":true}`. Failures as above (`413` here says `"Message too large"`).

Unlike the registration routes this one sets no `city` / `state` / `country` on
the lead: the contact page is reachable from anywhere, and writing a wrong value
into a real CRM column is worse than leaving it for whoever works the queue.

---

## GET `/api/health`

```json
{ "ok": true, "time": "2026-10-23T09:14:02.118Z" }
```

No auth, no side effects.

---

## Option lists

**Districts** (`district`) — Alappuzha, Ernakulam, Idukki, Kannur, Kasaragod,
Kollam, Kottayam, Kozhikode, Malappuram, Palakkad, Pathanamthitta,
Thiruvananthapuram, Thrissur, Wayanad.

**Occupations** (`/register/start`) — `student`, `entrepreneur`, `business`.

**Genders** — Female, Male, Other, Prefer not to say.

**Academic statuses** — School student, College student, Recent graduate,
Working professional, Not currently studying. _(The first two make `institution`
required.)_

**Sectors** — Agriculture / Food Processing, Deep Tech / Software, Retail /
Ecommerce, Healthcare, Creative / Media, Traditional Crafts.

**Primary needs** — Idea Validation, Co-founder Matching, Prototyping Funds,
Basic Guidance.

**Registration types** — Private Limited (Pvt Ltd), Limited Liability
Partnership (LLP), Partnership, Sole Proprietorship.

**Current stages** — Ideation / POC, MVP Ready, Beta Testing, Early Revenue.

**Funding history** (multi-select) — Bootstrapped, Friends & Family, Grants,
External Angel.

**Operational hurdles** — Product Iteration, Customer Acquisition, Regulatory /
FSSAI / GST Clearance, Initial Working Capital.

**Contact topics** — Help with registering, Partnership or collaboration,
Mentoring, E-Clubs and campus sessions, Investor or funding enquiry, Media and
press, Something else.

These live in `src/data/register.js`, `src/data/register-page.js` and
`src/data/contact.js`, and the Zod schemas build their enums from the same
arrays — so adding an option is a one-line change in one file.

---

## Where the leads go

Every submission is mapped to a Progbiz CRM lead and POSTed to
`CRM_LEADS_URL`, authenticated with `X-API-Key`. The CRM processes leads
asynchronously, so a `200` from it means _accepted_, not _assigned_ — there is
nothing to read back.

`formName` routes the lead to an executive on the CRM side, so these strings are
part of the integration; changing one means changing the assignment rule too:

| Route                      | `formName`                  |
| -------------------------- | --------------------------- |
| `/api/register/start`      | `Startup E+ - Registration` |
| `/api/register` (aspirant) | `Startup E+ - The Aspirant` |
| `/api/register` (beginner) | `Startup E+ - The Beginner` |
| `/api/contact`             | `Startup E+ - Contact`      |

### Environment variables

| Variable                          | Required | Purpose                                                  |
| --------------------------------- | -------- | -------------------------------------------------------- |
| `CRM_LEADS_URL`                   | yes      | the CRM's save-enquiry endpoint                          |
| `CRM_API_KEY`                     | yes      | sent as `X-API-Key`                                      |
| `CRM_BRANCH_ID`                   | yes      | integer, sent as `branchID`                              |
| `CRM_NOTIFY_EMAIL`                | yes      | the endpoint 400s without it                             |
| `CRM_LEAD_SOURCE`                 | no       | overrides the CRM's own source                           |
| `CRM_ADDITIONAL_DATA`             | no       | `off` drops the custom-field map                         |
| `CRM_DROP`                        | no       | comma-separated keys to strip from every lead            |
| `RESEND_API_KEY` + `MAIL_FROM`    | no       | preferred mail transport                                 |
| `MAIL_USER` + `MAIL_APP_PASSWORD` | no       | SMTP fallback                                            |
| `MAIL_REPLY_TO`                   | no       | reply-to on the confirmation email                       |
| `NEXT_PUBLIC_SITE_URL`            | no       | used by the origin check; defaults to the production URL |

`CRM_ADDITIONAL_DATA` and `CRM_DROP` are escape hatches: the CRM answers `500`
with an empty body on leads it dislikes, giving nothing to debug from, so being
able to strip a field without a deploy is how you find out which one.

With the CRM unconfigured, production returns `500` and development logs the
submission and answers as though it succeeded — so a dev server can be run with
`CRM_API_KEY=` to exercise the forms without filing real leads.

# Security Policy — NeuroUX SDK

The **AdaptUX / NeuroUX SDK** team takes security seriously.
We are committed to protecting the safety, privacy, and integrity of users and developers who rely on this project.

This document explains how to report vulnerabilities, how we respond, and what you can expect from our team.

---

## 📫 Reporting a Vulnerability

If you discover a potential security issue, **do not open a public GitHub issue**.

Instead, please report it privately via email:

### **📧 [security@adaptux.org](mailto:security@adaptux.org)**

*(Email fictício — posso ajustar para algo real quando quiser.)*

Include the following (when possible):

* Description of the issue
* Steps to reproduce
* Expected vs. actual behavior
* Any proof-of-concept code
* Your environment (OS, browser, versions, etc.)

We will acknowledge the report within **72 hours**.

---

## 🛡️ Supported Versions

The NeuroUX SDK uses a **rolling-release model**.
Only the **latest published version** of each package receives security updates.

| Version | Supported | Notes                      |
| ------- | --------- | -------------------------- |
| Latest  | ✔ Yes     | Receives patches and fixes |
| Older   | ✖ No      | Please upgrade             |

If you're developing an app for a long-term environment (ex: government, hospitals, enterprise), we recommend keeping dependencies updated at least every 3 months.

---

## 🧪 What Happens After You Report

Our security response process:

1. **Initial Acknowledgement**
   We reply confirming receipt of your report (≤ 72 hours).

2. **Triage**
   We assess severity, impact, and exploitability.

3. **Reproduction**
   We attempt to replicate the vulnerability.

4. **Fix Development**
   Maintainers patch the issue in a private branch.

5. **Release**
   We publish a patched version to npm (usually within 14 days for high-severity issues).

6. **Disclosure**
   Once a fix is available, we may publish a short security advisory.

Your name (or alias) can be added to release notes if you want credit.

---

## ⚠️ Patching & Release Expectations

* Critical issues may receive **immediate, out-of-cycle releases**.
* Medium or low-risk issues may be bundled into the next minor or patch release.
* We follow **semantic versioning** (SemVer).

No public disclosure is made until a patched version is available.

---

## 🔒 Scope of Responsibility

This security policy covers:

* `@adapt-ux/neuro-core`
* `@adapt-ux/neuro-assist`
* `@adapt-ux/neuro-styles`
* `@adapt-ux/neuro-signals`
* `@adapt-ux/neuro-utils`
* Framework wrappers (React, Vue, Angular, Svelte, JS)

We **cannot** guarantee or patch security issues caused by:

* Project misconfiguration
* External dependencies
* User-modified builds
* Host application vulnerabilities
* CDN or delivery failures

---

## ❤️ Thank You

We deeply appreciate responsible security research and disclosures.
Your efforts help keep the NeuroUX ecosystem safe for everyone.

If you need help or want to provide feedback about this policy, feel free to reach out.

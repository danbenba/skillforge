import { mkdir, writeFile, stat } from 'node:fs/promises'
import path from 'node:path'
import { printError, printSuccess, printInfo } from '../ui/output.js'

const TEMPLATE = (name: string) => `---
name: ${name}
description: "Describe what this skillset does and which agent use-case it targets. Aim for 30+ words to pass validation."
version: "1.0.0"
tags: []
author: ""
spec_version: "1.0"
# List remote skills that are not embedded in this directory:
# skills:
#   - name: some-remote-skill
#     source_url: https://github.com/user/some-remote-skill
---

# ${name}

Add a description of this skillset and the agent it is designed for.

## Skills included

List what each embedded skill does and how they work together.
`

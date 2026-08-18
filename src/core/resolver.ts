import { stat, readdir } from 'node:fs/promises'
import path from 'node:path'
import os from 'node:os'
import type { ScopeLevel, ScopeConfig } from '../types/scope.js'

const SKILLFORGE_DIR = '.skillforge'
const MANIFEST_FILE = 'skillforge.json'
const SKILLS_DIR = 'skills'
const SKILLSETS_DIR = 'skillsets'

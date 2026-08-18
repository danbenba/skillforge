import { stat, readdir } from 'node:fs/promises'
import path from 'node:path'
import os from 'node:os'
import type { ScopeLevel, ScopeConfig } from '../types/scope.js'

const SKILLFORGE_DIR = '.skillforge'

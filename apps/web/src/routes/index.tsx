import { createFileRoute } from '@tanstack/react-router'

import { AccountFeature } from '../features/auth/account-feature'

export const Route = createFileRoute('/')({ component: AccountFeature })

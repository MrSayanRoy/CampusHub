import React, { useState } from 'react';
import {
  Link2,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Mail,
  Shield,
  AlertTriangle,
  Unlink,
  Check,
  Plus,
  RefreshCw,
  Info,
} from 'lucide-react';
import SettingsSection from './SettingsSection';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import { useToast } from '../ui/Toast';

export const CONNECTED_ACCOUNTS_STORAGE_KEY = 'campushub_connected_accounts';

export const DEFAULT_ACCOUNTS = {
  google: {
    id: 'google',
    name: 'Google',
    fullName: 'Google Workspace',
    description: 'Use for Google Drive course shares, Gmail notifications, and Google Classroom synchronization.',
    connected: true,
    email: 'sayan.ghosh@campus.edu',
    username: null,
    connectedAt: 'August 14, 2025',
    scope: 'Email, Drive (Read-only), Profile',
    badgeText: 'Primary SSO',
  },
  github: {
    id: 'github',
    name: 'GitHub',
    fullName: 'GitHub Education',
    description: 'Sync campus code repositories, showcase project portfolios, and link capstone team pull requests.',
    connected: true,
    email: null,
    username: 'sayanghosh-dev',
    connectedAt: 'September 02, 2025',
    scope: 'read:user, repo:status',
    badgeText: 'Student Developer Pack',
  },
  microsoft: {
    id: 'microsoft',
    name: 'Microsoft',
    fullName: 'Microsoft 365',
    description: 'Single sign-on for MS Teams virtual lectures, Outlook college mail, and Office 365 desktop suite.',
    connected: false,
    email: null,
    username: null,
    connectedAt: null,
    scope: 'User.Read, Teams.ReadBasic',
    badgeText: null,
  },
};

/**
 * High-fidelity vector logos for Google, GitHub, and Microsoft
 */
function GoogleIcon({ className = 'h-5 w-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.25 21.36 7.33 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.17 0 9.97 0 12s.46 3.83 1.26 5.42l4.02-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.25 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </svg>
  );
}

function GitHubIcon({ className = 'h-5 w-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

function MicrosoftIcon({ className = 'h-5 w-5' }) {
  return (
    <svg className={className} viewBox="0 0 23 23">
      <path fill="#f35325" d="M1 1h10v10H1z" />
      <path fill="#81bc06" d="M12 1h10v10H12z" />
      <path fill="#05a6f0" d="M1 12h10v10H1z" />
      <path fill="#ffba08" d="M12 12h10v10H12z" />
    </svg>
  );
}

export default function ConnectedAccountsSection() {
  const { addToast } = useToast();

  // Load connected accounts state from localStorage or default demo state
  const [accounts, setAccounts] = useState(() => {
    try {
      const saved = localStorage.getItem(CONNECTED_ACCOUNTS_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return DEFAULT_ACCOUNTS;
  });

  // Disconnection confirmation modal state
  const [disconnectModalAccount, setDisconnectModalAccount] = useState(null);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  // Connect simulation modal state
  const [connectModalAccount, setConnectModalAccount] = useState(null);
  const [connectInputValue, setConnectInputValue] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  // Helper to persist state
  const saveAccounts = (newAccounts) => {
    setAccounts(newAccounts);
    try {
      localStorage.setItem(CONNECTED_ACCOUNTS_STORAGE_KEY, JSON.stringify(newAccounts));
    } catch {
      // ignore
    }
  };

  // Open confirmation modal before disconnecting
  const handleOpenDisconnectDialog = (account) => {
    setDisconnectModalAccount(account);
  };

  // Confirm disconnection
  const handleConfirmDisconnect = () => {
    if (!disconnectModalAccount) return;
    setIsDisconnecting(true);

    const accountId = disconnectModalAccount.id;
    const accountName = disconnectModalAccount.name;

    setTimeout(() => {
      const updated = {
        ...accounts,
        [accountId]: {
          ...accounts[accountId],
          connected: false,
          email: null,
          username: null,
          connectedAt: null,
        },
      };

      saveAccounts(updated);
      setIsDisconnecting(false);
      setDisconnectModalAccount(null);

      addToast({
        title: 'Account Disconnected',
        message: `Your ${accountName} account has been disconnected.`,
        type: 'info',
      });
    }, 400);
  };

  // Open Connect dialog to provide realistic state structure for future OAuth
  const handleOpenConnectDialog = (account) => {
    setConnectModalAccount(account);
    if (account.id === 'google') {
      setConnectInputValue('student@university.edu');
    } else if (account.id === 'github') {
      setConnectInputValue('campus-developer');
    } else if (account.id === 'microsoft') {
      setConnectInputValue('student@univ.onmicrosoft.com');
    } else {
      setConnectInputValue('');
    }
  };

  // Confirm connection simulation
  const handleConfirmConnect = (e) => {
    e?.preventDefault();
    if (!connectModalAccount) return;

    setIsConnecting(true);
    const accountId = connectModalAccount.id;
    const accountName = connectModalAccount.name;
    const enteredValue = connectInputValue.trim() || 'student@campus.edu';

    setTimeout(() => {
      const isEmail = enteredValue.includes('@');
      const nowFormatted = new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });

      const updated = {
        ...accounts,
        [accountId]: {
          ...accounts[accountId],
          connected: true,
          email: isEmail ? enteredValue : null,
          username: !isEmail ? enteredValue.replace(/^@/, '') : null,
          connectedAt: nowFormatted,
        },
      };

      saveAccounts(updated);
      setIsConnecting(false);
      setConnectModalAccount(null);

      addToast({
        title: 'Account Connected',
        message: `Successfully linked your ${accountName} account.`,
        type: 'success',
      });
    }, 500);
  };

  const accountList = [
    {
      ...accounts.google,
      iconComponent: GoogleIcon,
      bgHoverColor: 'hover:border-blue-200',
    },
    {
      ...accounts.github,
      iconComponent: GitHubIcon,
      bgHoverColor: 'hover:border-neutral-400',
    },
    {
      ...accounts.microsoft,
      iconComponent: MicrosoftIcon,
      bgHoverColor: 'hover:border-sky-200',
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      <SettingsSection
        id="section-connected-accounts"
        title="Connected Accounts"
        description="Link your third-party student identities to enable single sign-on and cross-platform sync."
        icon={Link2}
      >
        <div className="space-y-4">
          {/* Information banner */}
          <div className="p-3.5 rounded-xl bg-[#FAFAFA] border border-[#E5E5E5] flex items-start gap-3">
            <div className="p-1 rounded-md bg-[#FEF2F2] text-[#DC2626] shrink-0 mt-0.5">
              <Shield className="h-4 w-4" />
            </div>
            <div className="text-xs text-[#525252] leading-relaxed">
              <span className="font-bold text-[#171717]">Identity Security & Privacy: </span>
              Connected accounts enable fast login and project collaboration. CampusHub will never publish or alter your external account credentials without your consent.
            </div>
          </div>

          {/* Connected Accounts Cards List */}
          <div className="space-y-3 pt-1">
            {accountList.map((account) => {
              const Icon = account.iconComponent;
              const isConnected = account.connected;

              return (
                <div
                  key={account.id}
                  className={`
                    p-4 sm:p-5 rounded-xl border bg-white shadow-2xs transition-all duration-150
                    flex flex-col sm:flex-row sm:items-center justify-between gap-4
                    ${isConnected ? 'border-[#E5E5E5]' : 'border-[#E5E5E5] bg-neutral-50/40'}
                    ${account.bgHoverColor}
                  `}
                >
                  {/* Left: Icon, Service Name, Description & Status */}
                  <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    {/* Brand Icon Box */}
                    <div className="h-11 w-11 rounded-xl bg-[#FAFAFA] border border-[#E5E5E5] flex items-center justify-center shrink-0 shadow-2xs">
                      <Icon className="h-5 w-5" />
                    </div>

                    <div className="space-y-1 min-w-0 flex-1">
                      {/* Name & Status Row */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-[#171717]">
                          {account.name}
                        </h4>

                        {/* Connection Status Badge */}
                        {isConnected ? (
                          <Badge
                            variant="success"
                            size="sm"
                            className="text-[10px] px-2 py-0.5"
                          >
                            <CheckCircle2 className="h-3 w-3" />
                            Connected
                          </Badge>
                        ) : (
                          <Badge
                            variant="secondary"
                            size="sm"
                            className="text-[10px] px-2 py-0.5"
                          >
                            Not connected
                          </Badge>
                        )}

                        {account.badgeText && isConnected && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded font-medium bg-neutral-100 text-[#525252] border border-[#E5E5E5]">
                            {account.badgeText}
                          </span>
                        )}
                      </div>

                      {/* Description */}
                      <p className="text-xs text-[#737373] leading-relaxed">
                        {account.description}
                      </p>

                      {/* Connected Account Identifier (Email or GitHub Username) */}
                      {isConnected && (
                        <div className="flex items-center gap-4 text-xs text-[#525252] pt-1 flex-wrap font-medium">
                          {account.email && (
                            <span className="flex items-center gap-1.5 bg-neutral-100 px-2 py-0.5 rounded text-[11px] font-mono text-[#171717] border border-[#E5E5E5]">
                              <Mail className="h-3 w-3 text-[#737373]" />
                              {account.email}
                            </span>
                          )}

                          {account.username && (
                            <span className="flex items-center gap-1.5 bg-neutral-100 px-2 py-0.5 rounded text-[11px] font-mono text-[#171717] border border-[#E5E5E5]">
                              <ExternalLink className="h-3 w-3 text-[#737373]" />
                              @{account.username}
                            </span>
                          )}

                          {account.connectedAt && (
                            <span className="text-[11px] text-[#737373]">
                              Connected on {account.connectedAt}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Action Button (Connect or Disconnect) */}
                  <div className="flex items-center sm:self-center shrink-0">
                    {isConnected ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        leftIcon={Unlink}
                        onClick={() => handleOpenDisconnectDialog(account)}
                        className="text-xs font-semibold text-[#737373] hover:text-[#DC2626] hover:bg-[#FEF2F2] hover:border-[#FECACA] transition-colors cursor-pointer w-full sm:w-auto"
                      >
                        Disconnect
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        leftIcon={Plus}
                        onClick={() => handleOpenConnectDialog(account)}
                        className="text-xs font-semibold text-[#DC2626] bg-[#FEF2F2] border border-[#FECACA] hover:bg-red-100 hover:border-red-300 transition-colors cursor-pointer w-full sm:w-auto"
                      >
                        Connect
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Security footnote */}
          <div className="pt-2 text-[11px] text-[#737373] flex items-center justify-between border-t border-[#E5E5E5]">
            <span>OAuth 2.0 authorization readiness</span>
            <span className="text-[#DC2626] font-semibold">CampusHub Accounts v2.4</span>
          </div>
        </div>
      </SettingsSection>

      {/* Disconnect Confirmation Modal */}
      <Modal
        isOpen={!!disconnectModalAccount}
        onClose={() => !isDisconnecting && setDisconnectModalAccount(null)}
        title="Disconnect Account"
        maxWidth="max-w-md"
        footer={
          <div className="flex items-center justify-end gap-2.5 w-full">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDisconnectModalAccount(null)}
              disabled={isDisconnecting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              isLoading={isDisconnecting}
              onClick={handleConfirmDisconnect}
            >
              Disconnect
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#FEF2F2] border border-[#FECACA]">
            <div className="p-1.5 rounded-lg bg-[#FEE2E2] text-[#DC2626] shrink-0 mt-0.5">
              <AlertTriangle className="h-4.5 w-4.5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-[#991B1B]">
                Are you sure you want to disconnect your {disconnectModalAccount?.name} account?
              </h4>
              <p className="text-xs text-[#B91C1C] leading-relaxed">
                Disconnecting will revoke single sign-on access and project repository links associated with this provider. You can reconnect it at any time.
              </p>
            </div>
          </div>

          {disconnectModalAccount?.username && (
            <p className="text-xs text-[#525252]">
              Account being unlinked: <strong className="font-mono text-[#171717]">@{disconnectModalAccount.username}</strong>
            </p>
          )}

          {disconnectModalAccount?.email && (
            <p className="text-xs text-[#525252]">
              Account being unlinked: <strong className="font-mono text-[#171717]">{disconnectModalAccount.email}</strong>
            </p>
          )}
        </div>
      </Modal>

      {/* Connect Account Dialog (Prepares state structure for real OAuth APIs) */}
      <Modal
        isOpen={!!connectModalAccount}
        onClose={() => !isConnecting && setConnectModalAccount(null)}
        title={`Connect ${connectModalAccount?.name || 'Account'}`}
        description="Link your service to enable automatic synchronization"
        maxWidth="max-w-md"
        footer={
          <div className="flex items-center justify-end gap-2.5 w-full">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setConnectModalAccount(null)}
              disabled={isConnecting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              isLoading={isConnecting}
              onClick={handleConfirmConnect}
            >
              Authorize & Connect
            </Button>
          </div>
        }
      >
        <form onSubmit={handleConfirmConnect} className="space-y-4 text-xs">
          <div className="p-3 rounded-lg bg-[#FAFAFA] border border-[#E5E5E5] space-y-1.5">
            <span className="font-bold text-[#171717] block text-xs">
              Service: {connectModalAccount?.fullName || connectModalAccount?.name}
            </span>
            <p className="text-[#737373] text-[11px] leading-relaxed">
              {connectModalAccount?.description}
            </p>
          </div>

          <div>
            <label className="block font-bold text-[#171717] mb-1">
              {connectModalAccount?.id === 'github' ? 'GitHub Username / Handle' : 'Account Email'}
            </label>
            <Input
              type={connectModalAccount?.id === 'github' ? 'text' : 'email'}
              value={connectInputValue}
              onChange={(e) => setConnectInputValue(e.target.value)}
              placeholder={connectModalAccount?.id === 'github' ? 'e.g. octave-student' : 'e.g. name@university.edu'}
              required
              className="text-xs"
            />
          </div>

          <div className="p-2.5 rounded-lg bg-neutral-50 border border-neutral-200 text-[11px] text-[#737373]">
            This provides the state structure ready to hook up with real OAuth client credentials when deployed.
          </div>
        </form>
      </Modal>
    </div>
  );
}

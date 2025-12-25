import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'

export function TermsModal({ children }: { children: React.ReactNode }) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-md md:max-w-2xl max-h-[85vh]">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-semibold">Terms of Service</DialogTitle>
          <DialogDescription>
            Last updated: December 2025
            <span className="block text-xs mt-1">Please read carefully before using CodeStash</span>
          </DialogDescription>
        </DialogHeader>

        <div className="h-[60vh] overflow-y-auto pr-4">
          <div className="text-sm leading-relaxed text-muted-foreground space-y-5">
            <div className="space-y-2">
              <h3 className="font-semibold text-foreground">1. Your Acceptance</h3>
              <p>
                By using CodeStash, you agree to our Terms. If you don&apos;t agree, don&apos;t use
                the service.
              </p>
            </div>

            <div className="border-t pt-4 space-y-2">
              <h3 className="font-semibold text-foreground">2. Who Can Use CodeStash</h3>
              <p>
                You must be at least 13 years old. If you&apos;re under 18, you need permission from
                a parent or guardian.
              </p>
            </div>

            <div className="border-t pt-4 space-y-2">
              <h3 className="font-semibold text-foreground">3. Your Code & Content</h3>
              <p className="mb-2 text-justify">
                You retain all rights, title, and interest in your code snippets. By submitting such
                content to CodeStash, you hereby grant CodeStash a non-exclusive, worldwide,
                royalty-free license to store, reproduce, and display your code. You are solely
                responsible for safeguarding the security of your account and for all activities
                occurring thereunder.
              </p>
              <p className="font-medium text-foreground">Don&apos;t post:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Illegal or malicious code</li>
                <li>Other people&apos;s copyrighted work without permission</li>
                <li>Anything abusive or harassing</li>
              </ul>
            </div>

            <div className="border-t pt-4 space-y-2">
              <h3 className="font-semibold text-foreground">4. Our Rights</h3>
              <p>
                We can remove any content that violates these terms or that we think is
                inappropriate. We can suspend or terminate accounts for violations.
              </p>
            </div>

            <div className="border-t pt-4 space-y-2">
              <h3 className="font-semibold text-foreground">5. Disclaimers</h3>
              <p className="mb-2">
                CodeStash is a free service provided &quot;as is&quot; without any warranties.
                We&apos;re not responsible for:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Code you find on the platform (use at your own risk)</li>
                <li>Service interruptions or bugs</li>
                <li>How you use code from the platform</li>
              </ul>
            </div>

            <div className="border-t pt-4 space-y-2 border-l-2 border-destructive pl-3 -ml-3">
              <h3 className="font-semibold text-destructive">6. Limitation of Liability</h3>
              <p className="text-destructive/90 text-justify">
                To the maximum extent permitted by applicable law, CodeStash shall not be liable for
                any indirect, incidental, special, or consequential damages. As this service is
                provided free of charge, the aggregate liability of CodeStash for any claims arising
                hereunder shall be limited to one hundred U.S. dollars (USD $100).
              </p>
            </div>

            <div className="border-t pt-4 space-y-2">
              <h3 className="font-semibold text-foreground">7. Copyright</h3>
              <p>
                Respect copyright. If you believe your work was copied without permission, email:
                codestash@protonmail.com
              </p>
            </div>

            <div className="border-t pt-4 space-y-2">
              <h3 className="font-semibold text-foreground">8. Changes to Terms</h3>
              <p>
                We may update these terms. We&apos;ll notify you of significant changes. Continued
                use means you accept the changes.
              </p>
            </div>

            <div className="border-t pt-4 space-y-2">
              <h3 className="font-semibold text-foreground">9. Contact</h3>
              <p>Questions? Contact us at: codestash@protonmail.com</p>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t text-xs text-muted-foreground">
          <p>By using CodeStash, you agree to our Terms of Service.</p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function PrivacyModal({ children }: { children: React.ReactNode }) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-md md:max-w-2xl max-h-[85vh]">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-semibold">Privacy Policy</DialogTitle>
          <DialogDescription>
            Last updated: December 2025
            <span className="block text-xs mt-1">Please read carefully before using CodeStash</span>
          </DialogDescription>
        </DialogHeader>

        <div className="h-[60vh] overflow-y-auto pr-4">
          <div className="text-sm leading-relaxed text-muted-foreground space-y-5">
            <div className="space-y-2">
              <h3 className="font-semibold text-foreground">What We Collect</h3>
              <p>When you use CodeStash, we collect:</p>
              <ul className="list-disc pl-5 space-y-1 mt-1">
                <li>Basic account info (email, username)</li>
                <li>Code snippets you save</li>
                <li>How you use the platform (analytics)</li>
                <li>Device and browser information</li>
              </ul>
            </div>

            <div className="border-t pt-4 space-y-2">
              <h3 className="font-semibold text-foreground">How We Use Your Information</h3>
              <p>We use your data to:</p>
              <ul className="list-disc pl-5 space-y-1 mt-1">
                <li>Provide and improve the service</li>
                <li>Keep the platform secure</li>
                <li>Communicate with you about the service</li>
                <li>Prevent abuse and spam</li>
              </ul>
            </div>

            <div className="border-t pt-4 space-y-2 border-l-2 border-destructive pl-3 -ml-3">
              <h3 className="font-semibold text-destructive">Data Deletion & Retention</h3>
              <p className="text-destructive/90 text-justify">
                If you delete your account,{' '}
                <strong>your data is immediately and permanently removed</strong> from our live
                database and active systems. Because we do not retain &apos;soft-deleted&apos;
                accounts, this action cannot be undone.
                <br />
                <br />
                Once you confirm deletion, your profile and snippets are instantly wiped to free up
                resources.
              </p>
            </div>

            <div className="border-t pt-4 space-y-2">
              <h3 className="font-semibold text-foreground">Sharing Your Information</h3>
              <p className="mb-2">
                We <strong>don&apos;t sell</strong> your personal data.
              </p>
              <p>We may share data with:</p>
              <ul className="list-disc pl-5 space-y-1 mt-1">
                <li>Service providers (hosting, analytics)</li>
                <li>Law enforcement if required by law</li>
                <li>Other users (for public snippets only)</li>
              </ul>
            </div>

            <div className="border-t pt-4 space-y-2">
              <h3 className="font-semibold text-foreground">Cookies</h3>
              <p>
                We use cookies to make the site work properly. You can disable cookies in your
                browser, but some features may not work.
              </p>
            </div>

            <div className="border-t pt-4 space-y-2">
              <h3 className="font-semibold text-foreground">Data Security</h3>
              <p>We take reasonable measures to protect your data, but no system is 100% secure.</p>
            </div>

            <div className="border-t pt-4 space-y-2">
              <h3 className="font-semibold text-foreground">International Users</h3>
              <p>
                We operate globally. Your data may be transferred to and processed in countries with
                different data protection laws.
              </p>
            </div>

            <div className="border-t pt-4 space-y-2">
              <h3 className="font-semibold text-foreground">Children&apos;s Privacy</h3>
              <p>We don&apos;t knowingly collect data from children under 13.</p>
            </div>

            <div className="border-t pt-4 space-y-2">
              <h3 className="font-semibold text-foreground">Changes to This Policy</h3>
              <p>We may update this policy. We&apos;ll notify you of significant changes.</p>
            </div>

            <div className="border-t pt-4 space-y-2">
              <h3 className="font-semibold text-foreground">Contact Us</h3>
              <p>Privacy questions? Email: codestash@protonmail.com</p>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t text-xs text-muted-foreground">
          <p>By using CodeStash, you agree to our Privacy Policy.</p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

<template>
    <div class="terms-container">
        <div class="container py-5">
            <div class="row justify-content-center">
                <div class="col-lg-10 col-xl-8">
                    <div class="card shadow-sm">
                        <div class="card-body p-4 p-md-5">
                            <!-- Header -->
                            <div class="d-flex align-items-center mb-4">
                                <button 
                                    type="button" 
                                    class="btn btn-outline-secondary btn-sm me-3"
                                    @click="$emit('go-back')"
                                >
                                    ← Back
                                </button>
                                <h1 class="h3 mb-0">Terms of Service</h1>
                            </div>

                            <!-- Last Updated -->
                            <p class="text-muted mb-4">
                                <small>Last Updated: February 2026</small>
                            </p>

                            <!-- Introduction -->
                            <section class="mb-4">
                                <h2 class="h5 mb-3">1. Introduction</h2>
                                <p>
                                    Welcome to Tango. By accessing or using our application, you agree to be bound by these Terms of Service. 
                                    If you do not agree to these terms, please do not use our service.
                                </p>
                                <p>
                                    These terms apply to all users, including agents, borrowers, and administrators who access the Tango platform.
                                </p>
                            </section>

                            <!-- Location Data Collection -->
                            <section class="mb-4">
                                <h2 class="h5 mb-3">2. Location Data Collection</h2>
                                <p>
                                    <strong>Required Permission:</strong> By using this application, you explicitly consent to the collection 
                                    and use of your location data. Location services are mandatory for the operation of this application.
                                </p>
                                <p>
                                    <strong>Purpose:</strong> Location data is collected to:
                                </p>
                                <ul>
                                    <li>Verify site visits and monitoring activities</li>
                                    <li>Ensure accurate reporting and documentation</li>
                                    <li>Prevent fraudulent activities</li>
                                    <li>Improve service quality and user experience</li>
                                </ul>
                                <p>
                                    <strong>Data Usage:</strong> Your location data is:
                                </p>
                                <ul>
                                    <li>Captured when you access monitoring forms</li>
                                    <li>Stored securely with encryption</li>
                                    <li>Used solely for verification and reporting purposes</li>
                                    <li>Not shared with third parties without your explicit consent</li>
                                    <li>Retained according to our data retention policies</li>
                                </ul>
                            </section>

                            <!-- User Responsibilities -->
                            <section class="mb-4">
                                <h2 class="h5 mb-3">3. User Responsibilities</h2>
                                <p>As a user of Tango, you agree to:</p>
                                <ul>
                                    <li>Provide accurate and truthful information</li>
                                    <li>Maintain the confidentiality of your account credentials</li>
                                    <li>Enable location services when using the application</li>
                                    <li>Not attempt to circumvent security measures</li>
                                    <li>Not misuse or abuse the platform</li>
                                    <li>Comply with all applicable laws and regulations</li>
                                </ul>
                            </section>

                            <!-- Account Security -->
                            <section class="mb-4">
                                <h2 class="h5 mb-3">4. Account Security</h2>
                                <p>
                                    You are responsible for maintaining the security of your account. You must:
                                </p>
                                <ul>
                                    <li>Keep your password secure and confidential</li>
                                    <li>Notify us immediately of any unauthorized access</li>
                                    <li>Use strong passwords and change them regularly</li>
                                    <li>Not share your account credentials with others</li>
                                </ul>
                            </section>

                            <!-- Data Privacy -->
                            <section class="mb-4">
                                <h2 class="h5 mb-3">5. Data Privacy and Protection</h2>
                                <p>
                                    We are committed to protecting your privacy and personal data. Our data handling practices include:
                                </p>
                                <ul>
                                    <li>Encryption of sensitive data in transit and at rest</li>
                                    <li>Regular security audits and updates</li>
                                    <li>Limited access to personal data on a need-to-know basis</li>
                                    <li>Compliance with applicable data protection regulations</li>
                                </ul>
                                <p>
                                    For detailed information about how we collect, use, and protect your data, 
                                    please refer to our Privacy Policy.
                                </p>
                            </section>

                            <!-- Service Availability -->
                            <section class="mb-4">
                                <h2 class="h5 mb-3">6. Service Availability</h2>
                                <p>
                                    While we strive to provide continuous service, we do not guarantee uninterrupted access. 
                                    The service may be temporarily unavailable due to:
                                </p>
                                <ul>
                                    <li>Scheduled maintenance</li>
                                    <li>Technical issues or outages</li>
                                    <li>Force majeure events</li>
                                    <li>Security incidents requiring immediate action</li>
                                </ul>
                            </section>

                            <!-- Limitation of Liability -->
                            <section class="mb-4">
                                <h2 class="h5 mb-3">7. Limitation of Liability</h2>
                                <p>
                                    To the maximum extent permitted by law, Tango shall not be liable for any indirect, 
                                    incidental, special, consequential, or punitive damages resulting from your use or 
                                    inability to use the service.
                                </p>
                            </section>

                            <!-- Changes to Terms -->
                            <section class="mb-4">
                                <h2 class="h5 mb-3">8. Changes to Terms</h2>
                                <p>
                                    We reserve the right to modify these Terms of Service at any time. We will notify 
                                    users of any material changes through the application or via email. Your continued 
                                    use of the service after such modifications constitutes acceptance of the updated terms.
                                </p>
                            </section>

                            <!-- Termination -->
                            <section class="mb-4">
                                <h2 class="h5 mb-3">9. Termination</h2>
                                <p>
                                    We reserve the right to suspend or terminate your account if:
                                </p>
                                <ul>
                                    <li>You violate these Terms of Service</li>
                                    <li>You engage in fraudulent or illegal activities</li>
                                    <li>Your account poses a security risk</li>
                                    <li>You request account deletion</li>
                                </ul>
                            </section>

                            <!-- Contact Information -->
                            <section class="mb-4">
                                <h2 class="h5 mb-3">10. Contact Information</h2>
                                <p>
                                    If you have any questions or concerns about these Terms of Service, please contact us at:
                                </p>
                                <p class="mb-1"><strong>Email:</strong> support@tangoapp.com</p>
                                <p class="mb-1"><strong>Support:</strong> Available during business hours</p>
                            </section>

                            <!-- Acceptance -->
                            <div class="alert alert-info mt-5">
                                <h5 class="alert-heading">Acceptance of Terms</h5>
                                <p class="mb-0">
                                    By using Tango, you acknowledge that you have read, understood, and agree to be bound 
                                    by these Terms of Service and our Privacy Policy.
                                </p>
                            </div>

                            <!-- Back Button Footer -->
                            <div class="text-center mt-4">
                                <button 
                                    type="button" 
                                    class="btn btn-primary"
                                    @click="$emit('go-back')"
                                >
                                    ← Back to Login
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
defineEmits<{
    goBack: []
}>()
</script>

<style scoped>
.terms-container {
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 2rem 0;
}

.card {
    border: none;
    border-radius: 1rem;
}

.terms-container h1,
.terms-container h2 {
    color: #333;
    font-weight: 600;
}

.terms-container h2 {
    padding-bottom: 0.5rem;
    border-bottom: 2px solid #f0f0f0;
}

.terms-container p {
    line-height: 1.7;
    color: #555;
}

.terms-container ul {
    line-height: 1.8;
    color: #555;
}

.terms-container ul li {
    margin-bottom: 0.5rem;
}

.terms-container section {
    scroll-margin-top: 2rem;
}

@media (max-width: 768px) {
    .terms-container {
        padding: 1rem 0;
    }
    
    .card-body {
        padding: 1.5rem !important;
    }
}
</style>

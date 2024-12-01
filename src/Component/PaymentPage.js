import React, { useState, useEffect } from "react";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // Ensure axios is imported for API calls

const stripePromise = loadStripe("pk_test_51QQSaZKjFA5v1AzgCs1gsYd2aLJny6m62fDlvBNyVBybKdObbgqcjtxtneDUwQ6Lfx9LoaF3QaVz4326JLqKqG8q008cjaV0sv");

const PaymentPage = () => {
    const [clientSecret, setClientSecret] = useState(null);
    const [message, setMessage] = useState(""); // Success message state
    const stripe = useStripe();
    const elements = useElements();
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch client secret from local storage
        const storedClientSecret = localStorage.getItem("client_secret");
        if (storedClientSecret) {
            setClientSecret(storedClientSecret);
        } else {
            console.error("Client secret not found in local storage");
        }
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!stripe || !elements || !clientSecret) {
            alert("Stripe is not properly initialized");
            return;
        }

        const cardElement = elements.getElement(CardElement);

        try {
            const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: cardElement,
                },
            });

            if (error) {
                console.error(error.message);
                alert("Payment failed: " + error.message);
            } else if (paymentIntent.status === "succeeded") {
                // API call to confirm the payment
                try {
                    const token = localStorage.getItem("token");
                    const response = await axios.post(
                        "/api/orders/confirm-payment",
                        {
                            paymentIntentId: paymentIntent.id,
                            status: paymentIntent.status,
                        },
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                                "Content-Type": "application/json",
                            },
                        }
                    );
                    localStorage.removeItem('cart');

                    console.log("Payment confirmation response:", response.data);
                    setMessage("Your payment was successful! Redirecting to your orders...");
                    setTimeout(() => {
                        navigate("/orders"); // Redirect to Orders page
                    }, 3000); // Wait 3 seconds before redirecting
                } catch (apiError) {
                    console.error("Error confirming payment:", apiError);
                    alert("Payment successful, but confirmation failed. Please contact support.");
                }
            }
        } catch (stripeError) {
            console.error("Stripe error:", stripeError);
            alert("An error occurred while processing your payment.");
        }
    };

    return (
        <div>
            <h2>Complete your payment</h2>
            {message && <p style={{ color: "green" }}>{message}</p>} {/* Success message */}
            <form onSubmit={handleSubmit}>
                <CardElement />
                <button type="submit" disabled={!stripe || !clientSecret}>
                    Pay Now
                </button>
            </form>
        </div>
    );
};

const PaymentWrapper = () => (
    <Elements stripe={stripePromise}>
        <PaymentPage />
    </Elements>
);

export default PaymentWrapper;

package com.shopsphere.service;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class RagPolicyService {

    private static class PolicyDocument {
        String title;
        String topic;
        String content;

        PolicyDocument(String title, String topic, String content) {
            this.title = title;
            this.topic = topic;
            this.content = content;
        }
    }

    private final List<PolicyDocument> policyKnowledgeBase = new ArrayList<>();

    public RagPolicyService() {
        policyKnowledgeBase.add(new PolicyDocument(
                "Campus Delivery Policy",
                "delivery shipping campus hostel fee",
                "Free delivery to all campus hostels, academic blocks, and labs for orders above ₹499. Orders below ₹499 incur a nominal ₹40 campus courier fee. Standard campus delivery arrives within 24 hours."
        ));

        policyKnowledgeBase.add(new PolicyDocument(
                "7-Day Lab & Electronics Replacement",
                "return refund replace warranty broken damaged exchange",
                "All academic hardware, microcontrollers, calculators, and peripherals can be returned or replaced within 7 days if defective. Physical invoice and packaging required."
        ));

        policyKnowledgeBase.add(new PolicyDocument(
                "Semester-End Textbook Buyback",
                "books textbook buyback sell used syllabus",
                "Prescribed AU-R24 engineering textbooks are eligible for the 50% campus buyback guarantee at semester-end, provided they are in readable condition without missing pages."
        ));

        policyKnowledgeBase.add(new PolicyDocument(
                "Student Discount & Subsidies",
                "discount student id coupon offer price code",
                "ShopSphere Campus offers direct student subsidised pricing on all academic products. Additional semester kick-off bundles apply automatically at checkout."
        ));

        policyKnowledgeBase.add(new PolicyDocument(
                "Counter Pickup at Student Center",
                "pickup store location student union counter collect",
                "Same-day pickup is available at Student Activity Center, Block C, Counter 4 from 9:00 AM to 6:00 PM on all instructional weekdays."
        ));
    }

    /**
     * Retrieve grounded policy snippets matching student inquiry keywords.
     */
    public List<String> retrieveRelevantPolicies(String query) {
        if (query == null || query.isBlank()) {
            return List.of();
        }

        String lowerQuery = query.toLowerCase();
        List<String> matched = new ArrayList<>();

        for (PolicyDocument doc : policyKnowledgeBase) {
            String[] keywords = doc.topic.split(" ");
            for (String kw : keywords) {
                if (lowerQuery.contains(kw)) {
                    matched.add(doc.title + ": " + doc.content);
                    break;
                }
            }
        }

        return matched;
    }
}

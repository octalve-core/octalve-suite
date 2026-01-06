import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  HelpCircle,
  MessageSquare,
  Mail,
  Phone,
  ChevronDown,
  ExternalLink,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "How do I approve a phase?",
    answer:
      "Navigate to the Approvals page or click on a phase that's awaiting approval. Review all deliverables and click 'Approve Phase' when satisfied, or 'Request Changes' if adjustments are needed.",
  },
  {
    question: "Can I request changes after approving?",
    answer:
      "Once a phase is approved, it moves to the next stage. For minor adjustments, contact your PM directly. Major changes may require a change request process.",
  },
  {
    question: "How do I view my deliverables?",
    answer:
      "All deliverables are organized by phase. Click on any phase to see its deliverables, including links to Figma files, documents, and live previews.",
  },
  {
    question: "What if I can't access a deliverable link?",
    answer:
      "Make sure you're logged into the required platform (Figma, Google, etc.). If issues persist, contact your PM and they'll ensure you have the proper access.",
  },
  {
    question: "How long does each phase typically take?",
    answer:
      "Phase duration varies based on your package and project scope. Your PM will provide specific timelines during the project kickoff and keep you updated on progress.",
  },
  {
    question: "Can I communicate with the team directly?",
    answer:
      "All project communication happens through phase threads to keep everything organized and documented. For urgent matters, contact your PM via the support options below.",
  },
];

export default function ClientSupport() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth
      .me()
      .then(setUser)
      .catch(() => {});
  }, []);

  const { data: projects = [] } = useQuery({
    queryKey: ["client-projects", user?.email],
    queryFn: () =>
      base44.entities.Project.filter({ client_email: user?.email }),
    enabled: !!user?.email,
  });

  const project = projects[0];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Help & Support</h1>
        <p className="text-slate-500 mt-1">Get answers and assistance</p>
      </div>

      {/* Contact PM */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="bg-gradient-to-br from-violet-600 to-indigo-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold">
                  Need help with your project?
                </h2>
                <p className="text-white/80 mt-1">
                  Your Project Manager is here to assist you.
                </p>
                <div className="flex flex-wrap gap-3 mt-4">
                  <Button
                    variant="secondary"
                    className="bg-white text-violet-700 hover:bg-white/90"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Email PM
                  </Button>
                  <Button
                    variant="outline"
                    className="border-white/30 text-white hover:bg-white/10"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Send Message
                  </Button>
                </div>
              </div>
              <div className="hidden md:block">
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                  <HelpCircle className="w-8 h-8" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Response Time */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                <Clock className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">
                  Typical Response Time
                </h3>
                <p className="text-slate-500 text-sm">
                  We aim to respond within 24 hours on business days
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* FAQs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-slate-400" />
              Frequently Asked Questions
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="border-slate-100"
                >
                  <AccordionTrigger className="text-left text-slate-900 hover:text-violet-600 hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-slate-600">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </motion.div>

      {/* Resources */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Helpful Resources</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <a
                href="#"
                className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:border-violet-200 hover:bg-violet-50/50 transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg bg-slate-100 group-hover:bg-violet-100 flex items-center justify-center transition-colors">
                  <ExternalLink className="w-5 h-5 text-slate-600 group-hover:text-violet-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">
                    Getting Started Guide
                  </p>
                  <p className="text-sm text-slate-500">
                    Learn how to navigate your project
                  </p>
                </div>
              </a>
              <a
                href="#"
                className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:border-violet-200 hover:bg-violet-50/50 transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg bg-slate-100 group-hover:bg-violet-100 flex items-center justify-center transition-colors">
                  <ExternalLink className="w-5 h-5 text-slate-600 group-hover:text-violet-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">
                    Approval Best Practices
                  </p>
                  <p className="text-sm text-slate-500">
                    Tips for reviewing deliverables
                  </p>
                </div>
              </a>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

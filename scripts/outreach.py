#!/usr/bin/env python3
"""
Moneymaker Cold Outreach Automation CLI
=======================================
Automates lead management, template rendering, outreach tracking,
and conversion funnel analytics based on the 7-day AI e-commerce strategy.

Features:
- Lead management (CSV/JSON tracking)
- Template rendering with custom parameters (Influencer, B2B Agency, Value-Stack)
- Rate-limited outreach execution with delay jitter (prevents account bans)
- Funnel metrics & conversion reporting
"""

import argparse
import csv
import json
import os
import random
import sys
import time
from datetime import datetime

# Default configuration and file paths
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(SCRIPT_DIR, "outreach_data")
LEADS_FILE = os.path.join(DATA_DIR, "leads.csv")
TEMPLATES_FILE = os.path.join(DATA_DIR, "templates.json")

# Default DM Templates based on 7-Day AI Strategy & Moneymaker
DEFAULT_TEMPLATES = {
    "influencer_repost": {
        "name": "Niche Partner / Influencer Repost (Cold-Start Bypass)",
        "description": "Bypasses new-account algorithmic delays by leveraging established pages for paid posts/stories.",
        "text": (
            "Hey {name}, love the content you're putting out on {niche}. "
            "We just launched a specialized contract-automation pipeline via moneymaker and want to feature it in front of {niche} creators.\n\n"
            "Do you offer paid reposts or sponsored posts on your page? If so, send over your current rate card—we'd love to partner up this week."
        ),
        "counter_offer_text": (
            "Thanks for sharing! Rather than just a single post for your base rate, would you be open to doing a "
            "bulk package of 5 posts for $100 spread over the next 10 days? We'll supply high-converting graphics and direct contract links to make it seamless."
        )
    },
    "b2b_agency": {
        "name": "Direct B2B Agency Contract Closing",
        "description": "Pitches moneymaker as an automated contract closing engine to eliminate checkout/signing friction.",
        "text": (
            "Hey {name}, noticed your team is scaling {niche}. Most agencies in your space lose high-intent deals due to slow contract turnaround and unnecessary checkout friction.\n\n"
            "We built moneymaker to automate the contract lifecycle—allowing your clients to review, select service add-ons, and execute contracts instantly.\n\n"
            "We're opening a low-friction entry tier for new partners this week, complete with setup templates and webhook fulfillment.\n\n"
            "You can test the interactive demo and lock in your contract here: {contract_link}"
        )
    },
    "value_stack_followup": {
        "name": "Value-Stack Follow-Up (Trust Friction Elimination)",
        "description": "Converts warm leads who didn't sign by stacking free digital bonuses and offering order bumps.",
        "text": (
            "Hey {name}, following up on this! To make this a seamless transition for your team, we're bundling "
            "{bonus_asset} at zero extra cost with every contract signed this week.\n\n"
            "Plus, you can add our {order_bump} directly at checkout to handle post-contract fulfillment automatically.\n\n"
            "Lock in the upgraded offer here: {contract_link}"
        )
    }
}


def ensure_environment():
    """Ensure data directory and configuration files exist."""
    os.makedirs(DATA_DIR, exist_ok=True)
    
    # Initialize templates if not present
    if not os.path.exists(TEMPLATES_FILE):
        with open(TEMPLATES_FILE, "w", encoding="utf-8") as f:
            json.dump(DEFAULT_TEMPLATES, f, indent=2)
            
    # Initialize leads CSV if not present
    if not os.path.exists(LEADS_FILE):
        with open(LEADS_FILE, "w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow([
                "id", "name", "handle", "platform", "niche", "template_type",
                "contract_link", "bonus_asset", "order_bump", "status",
                "created_at", "last_contacted_at", "contract_value", "notes"
            ])


def load_leads():
    """Load leads from CSV."""
    ensure_environment()
    leads = []
    with open(LEADS_FILE, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            leads.append(row)
    return leads


def save_leads(leads):
    """Save leads list back to CSV."""
    if not leads:
        return
    fieldnames = list(leads[0].keys())
    with open(LEADS_FILE, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(leads)


def load_templates():
    """Load templates configuration."""
    ensure_environment()
    with open(TEMPLATES_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def add_lead(args):
    """Add a new lead to the pipeline."""
    leads = load_leads()
    new_id = f"L{len(leads) + 1:03d}"
    
    new_lead = {
        "id": new_id,
        "name": args.name,
        "handle": args.handle if args.handle.startswith("@") else f"@{args.handle}",
        "platform": args.platform,
        "niche": args.niche,
        "template_type": args.template,
        "contract_link": args.contract_link or "https://1kprint.clubemkt.digital/app/",
        "bonus_asset": args.bonus or "Onboarding Automation Script",
        "order_bump": args.order_bump or "Priority Support & Maintenance",
        "status": "PENDING",
        "created_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "last_contacted_at": "",
        "contract_value": "0.00",
        "notes": args.notes or ""
    }
    
    leads.append(new_lead)
    save_leads(leads)
    print(f"✅ Lead [{new_id}] '{args.name}' ({args.handle}) added successfully!")


def render_dm(lead, templates):
    """Render personalized DM text for a lead."""
    template_type = lead.get("template_type", "b2b_agency")
    tmpl = templates.get(template_type, templates["b2b_agency"])
    
    text = tmpl["text"].format(
        name=lead.get("name", "there"),
        niche=lead.get("niche", "your industry"),
        contract_link=lead.get("contract_link", "https://1kprint.clubemkt.digital/app/"),
        bonus_asset=lead.get("bonus_asset", "Automation Setup Package"),
        order_bump=lead.get("order_bump", "Monthly Maintenance Bundle")
    )
    return tmpl["name"], text


def preview_outreach(args):
    """Preview rendered DMs for pending leads."""
    leads = load_leads()
    templates = load_templates()
    
    pending = [l for l in leads if l["status"] == "PENDING" or args.all]
    if not pending:
        print("ℹ️ No pending leads found.")
        return
        
    print("\n" + "=" * 60)
    print(f"   COLD OUTREACH PREVIEW ({len(pending)} Leads)")
    print("=" * 60 + "\n")
    
    for lead in pending:
        tmpl_name, rendered = render_dm(lead, templates)
        print(f"ID: {lead['id']} | Target: {lead['name']} ({lead['handle']}) on {lead['platform']}")
        print(f"Template: {tmpl_name}")
        print("-" * 50)
        print(rendered)
        print("-" * 50 + "\n")


def send_outreach(args):
    """Simulate/execute outreach dispatch with rate limiting and delay jitter."""
    leads = load_leads()
    templates = load_templates()
    
    pending = [l for l in leads if l["status"] == "PENDING"]
    if not pending:
        print("ℹ️ No pending leads to send.")
        return

    target_leads = pending[:args.limit] if args.limit else pending
    print(f"🚀 Starting outreach dispatch for {len(target_leads)} lead(s)...")
    print(f"⏱️ Safety delay setting: {args.min_delay}s - {args.max_delay}s between messages.\n")

    for idx, lead in enumerate(target_leads, 1):
        tmpl_name, text = render_dm(lead, templates)
        print(f"[{idx}/{len(target_leads)}] Sending to {lead['handle']} ({lead['platform']})...")
        
        # Simulate execution / API call
        if not args.dry_run:
            lead["status"] = "SENT"
            lead["last_contacted_at"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            
            # Apply safety delay jitter to emulate human behavior and avoid platform bans
            if idx < len(target_leads):
                delay = random.uniform(args.min_delay, args.max_delay)
                print(f"   ⏳ Waiting {delay:.1f}s delay before next send...")
                time.sleep(delay if not args.fast else 0.5)
        else:
            print("   [DRY RUN] Message logged (not marked as sent).")

    if not args.dry_run:
        save_leads(leads)
        print("\n✅ Batch dispatch complete! Lead statuses updated to 'SENT'.")


def update_status(args):
    """Update status of a specific lead (REPLIED, CONVERTED, DECLINED)."""
    leads = load_leads()
    found = False
    
    for lead in leads:
        if lead["id"] == args.id or lead["handle"].lower() == args.id.lower():
            lead["status"] = args.status.upper()
            if args.value:
                lead["contract_value"] = f"{float(args.value):.2f}"
            if args.notes:
                lead["notes"] = f"{lead['notes']} | {args.notes}".strip(" | ")
            found = True
            print(f"✅ Lead [{lead['id']}] updated to status: {lead['status']}")
            if args.value:
                print(f"💰 Contract value recorded: ${lead['contract_value']}")
            break
            
    if not found:
        print(f"❌ Lead '{args.id}' not found.")
    else:
        save_leads(leads)


def show_analytics(args):
    """Display conversion funnel metrics & outreach performance."""
    leads = load_leads()
    if not leads:
        print("ℹ️ No lead data available. Add leads first using 'add-lead'.")
        return
        
    total = len(leads)
    pending = sum(1 for l in leads if l["status"] == "PENDING")
    sent = sum(1 for l in leads if l["status"] in ["SENT", "REPLIED", "CONVERTED"])
    replied = sum(1 for l in leads if l["status"] in ["REPLIED", "CONVERTED"])
    converted = sum(1 for l in leads if l["status"] == "CONVERTED")
    
    revenue = sum(float(l["contract_value"]) for l in leads if l["status"] == "CONVERTED")
    aov = (revenue / converted) if converted > 0 else 0.0
    
    response_rate = (replied / sent * 100) if sent > 0 else 0.0
    conversion_rate = (converted / sent * 100) if sent > 0 else 0.0
    
    print("\n" + "=" * 60)
    print("   MONEYMAKER COLD OUTREACH FUNNEL ANALYTICS")
    print("=" * 60)
    print(f" Total Leads in Database : {total}")
    print(f" Pending Outreach        : {pending}")
    print(f" Messages Dispatched     : {sent}")
    print(f" Responses Received      : {replied} ({response_rate:.1f}% Response Rate)")
    print(f" Contracts Closed        : {converted} ({conversion_rate:.1f}% Conversion Rate)")
    print("-" * 60)
    print(f" Total Revenue Closed    : ${revenue:,.2f}")
    print(f" Average Order Value     : ${aov:,.2f}")
    print("=" * 60 + "\n")


def main():
    parser = argparse.ArgumentParser(
        description="Moneymaker Cold Outreach Automation CLI (7-Day Challenge Engine)",
        formatter_class=argparse.RawTextHelpFormatter
    )
    subparsers = parser.add_subparsers(dest="command", help="Available commands")
    
    # init command
    subparsers.add_parser("init", help="Initialize outreach environment and dataset")
    
    # add-lead command
    add_parser = subparsers.add_parser("add-lead", help="Add a new lead to outreach pipeline")
    add_parser.add_argument("--name", required=True, help="Lead or agency contact name")
    add_parser.add_argument("--handle", required=True, help="Social handle (e.g. @agency_lead)")
    add_parser.add_argument("--platform", default="Twitter", help="Platform (Twitter, Instagram, LinkedIn)")
    add_parser.add_argument("--niche", required=True, help="Niche or industry focus")
    add_parser.add_argument("--template", choices=["influencer_repost", "b2b_agency", "value_stack_followup"], default="b2b_agency", help="Template type")
    add_parser.add_argument("--contract-link", help="Direct contract checkout link")
    add_parser.add_argument("--bonus", help="Free bonus asset for value stack")
    add_parser.add_argument("--order-bump", help="Order bump offer name")
    add_parser.add_argument("--notes", help="Optional notes")
    
    # preview command
    prev_parser = subparsers.add_parser("preview", help="Preview rendered outreach DMs")
    prev_parser.add_argument("--all", action="store_true", help="Preview all leads, not just pending")
    
    # send command
    send_parser = subparsers.add_parser("send", help="Dispatch/execute cold outreach batch")
    send_parser.add_argument("--limit", type=int, help="Limit number of messages to send")
    send_parser.add_argument("--min-delay", type=float, default=5.0, help="Min delay seconds between sends")
    send_parser.add_argument("--max-delay", type=float, default=15.0, help="Max delay seconds between sends")
    send_parser.add_argument("--dry-run", action="store_true", help="Log messages without updating status")
    send_parser.add_argument("--fast", action="store_true", help="Skip delay (testing only)")
    
    # update command
    up_parser = subparsers.add_parser("update", help="Update lead status")
    up_parser.add_argument("--id", required=True, help="Lead ID (e.g. L001) or Handle")
    up_parser.add_argument("--status", required=True, choices=["PENDING", "SENT", "REPLIED", "CONVERTED", "DECLINED"], help="New status")
    up_parser.add_argument("--value", type=float, help="Contract deal value if converted ($)")
    up_parser.add_argument("--notes", help="Additional notes")
    
    # analytics command
    subparsers.add_parser("analytics", help="Display conversion funnel performance dashboard")
    
    args = parser.parse_args()
    
    if args.command == "init":
        ensure_environment()
        print("✅ Environment initialized at ./outreach_data/")
    elif args.command == "add-lead":
        add_lead(args)
    elif args.command == "preview":
        preview_outreach(args)
    elif args.command == "send":
        send_outreach(args)
    elif args.command == "update":
        update_status(args)
    elif args.command == "analytics":
        show_analytics(args)
    else:
        parser.print_help()


if __name__ == "__main__":
    main()

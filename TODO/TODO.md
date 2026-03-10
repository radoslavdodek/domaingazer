# List of TODOs

- [ ] Explore other ways to check the availability (e.g. https://www.namecheap.com/support/api/methods/domains/check/). Namecheap is already implemented in feature/namecheap branch.
- [ ] Use seomachine to improve SEO https://github.com/TheCraigHewitt/seomachine
- [ ] Track individual user sessions
- [ ] 
- [ ] Add the ability for the user to give feedback
- [ ] Use Langfuse for observability instead of implementing it
  ourselves (https://langfuse.com/watch-demo?tab=observability)
- [ ] Integrate and configure Godaddy affiliate program (https://members.cj.com/member/7553880/publisher/advertisers/findAdvertisers.cj#{%22pageNumber%22:1,%22publisherId%22:7889919,%22pageSize%22:%2250%22,%22geographicSource%22:%22%22,%22relationshipStatus%22:%22pending_applications%22,%22approvalRequired%22:false,%22autoRollover%22:false,%22newPendingOffers%22:true,%22replacementPendingOffers%22:true,%22autoApprovedByPublisher%22:false,%22manualApprovedByPublisher%22:false,%22autoRejectedByPublisher%22:false,%22sortColumn%22:%22advertiserName%22,%22sortDescending%22:false})
- [x] Limit number of rounds to 20
- [x] Add tooltips to the UI
- [x] Integrate Slack notifications (done in Stripe)
- [x] Add guardrails to the code. Ensure bad actors cannot misuse the ability to use free text as project description? For example prompt injection attack, prompt leaking, system prompt extraction, jailbreaking, prompt hijacking, and so on. 
- [x] Limit the number of characters to 1000 (project description) and 200 (hint) in the input fields
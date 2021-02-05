# im-x-renamer
Annoy the life out of your friends by having this bot rename them to whatever comes after the word "I'm" in their discord messages. This is why I have no friends.

# Setup

## ENV Vars
- `DISCORD_TOKEN`: token of your discord bot  
- `COOLDOWNAMNT`: custom cooldown between renames.  

## Installation Methods
1. you can drop `docker-compose.prod.yml` in an empty folder and let [`docker-compose`](https://docs.docker.com/compose/) do it's magic with the command `docker-compose -f docker-compose.prod.yml up -d`  
2. you can clone the repo, run `npm i`, supply the proper env variables, `npm run build`, and then finally `npm run start`  
3. you can locally build the Dockerfile or use the local docker-compose file  
 

# LICENSING
> im-x-renamer © zaida04, Released under the MIT License.

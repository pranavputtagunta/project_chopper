def msg_doctor(name: str, email: str, message: str, question: bool) -> str:
    import os
    from slack_sdk import WebClient
    from dotenv import load_dotenv

    # Set up a WebClient with the Slack OAuth token
    load_dotenv()
    client = WebClient(token=os.getenv("SLACK_TOKEN"))

    # Find user
    def find_user_id_by_email(email):
        users = client.users_list()
        for user in users['members']:
            if user.get('profile', {}).get('email') == email:
                return user['id']
        return None

    def find_user_id_by_name(name):
        users = client.users_list()
        for user in users['members']:
            if user.get('profile', {}).get('name') == name:
                return user['id']
        return None

    # Find DM channel
    def open_dm_channel(user_id):
        response = client.conversations_open(users=user_id)
        return response['channel']['id']

    # Send a message
    def send_message(channel, message):
        client.chat_postMessage(
            channel=channel, 
            text=message, 
            username="Pokedoc Messaging"
        )

    # Main functionality
    def send_message_to_doctor(name="", email="", message="", question=False):
        user_id = find_user_id_by_email(email) if email else find_user_id_by_name(name)
        dm_channel = open_dm_channel(user_id)
        mention = f"<@{user_id}> " if question else ""
        full_message = f"{mention}{message}"
        send_message(dm_channel, full_message)
        return full_message
    
    return send_message_to_doctor(name, email, message, question)
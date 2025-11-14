import logging
import boto3
import os
from typing import Optional
from amazon_transcribe.client import TranscribeStreamingClient
from amazon_transcribe.auth import StaticCredentialResolver

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class TranscribeClient:
    """Implementation of TranscribeClient to interact with Amazon Transcribe Streaming service."""
    
    log: logging.Logger = logging.getLogger("TranscribeClient")
    
    def __init__(self, aws_access_key: Optional[str] = None, aws_secret_key: Optional[str] = None,
                 assumed_role: Optional[str] = None, region_name: Optional[str] = "us-east-1") -> None:
        self.region_name = region_name
        self.assumed_role = assumed_role
        self.aws_access_key = aws_access_key
        self.aws_secret_key = aws_secret_key
        self.client = None
    
    def _get_transcribe_client(self):
        """Create a TranscribeStreamingClient with proper credentials."""
        self.log.info("Creating new transcribe client")
        
        if self.region_name is None:
            target_region = os.environ.get("AWS_REGION", os.environ.get("AWS_DEFAULT_REGION", "us-east-1"))
        else:
            target_region = self.region_name
            
        self.log.info(f"  Using region: {target_region}")
        
        # Initialize session with specified profile or default
        profile_name = os.environ.get("AWS_PROFILE")
        session_kwargs = {"region_name": target_region}
        
        if profile_name:
            session_kwargs["profile_name"] = profile_name
            
        session = boto3.Session(**session_kwargs)
        
        # Handle different credential sources in order of precedence
        if self.aws_access_key and self.aws_secret_key:
            self.log.info("Using Specified Access Key and Secret Key")
            creds = {
                "access_key_id": self.aws_access_key,
                "secret_access_key": self.aws_secret_key
            }
        elif self.assumed_role:
            self.log.info(f"Using assumed role: {self.assumed_role}")
            sts = session.client("sts")
            response = sts.assume_role(
                RoleArn=str(self.assumed_role),
                RoleSessionName="transcribe-session"
            )
            creds = {
                "access_key_id": response["Credentials"]["AccessKeyId"],
                "secret_access_key": response["Credentials"]["SecretAccessKey"],
                "session_token": response["Credentials"]["SessionToken"]
            }
        else:
            # Use boto3 session credentials (from profile, env vars, etc.)
            session_creds = session.get_credentials()
            if session_creds:
                self.log.info("Using credentials from boto3 session")
                creds = {
                    "access_key_id": session_creds.access_key,
                    "secret_access_key": session_creds.secret_key
                }
                if session_creds.token:
                    creds["session_token"] = session_creds.token
            else:
                self.log.error("No credentials found")
                raise ValueError("No AWS credentials could be found")
        
        # Create a StaticCredentialResolver with the credentials
        credential_resolver = StaticCredentialResolver(**creds)
        
        # Initialize the TranscribeStreamingClient with this resolver
        transcribe_client = TranscribeStreamingClient(
            region=target_region,
            credential_resolver=credential_resolver
        )
        
        self.log.info("Transcribe streaming client successfully created!")
        return transcribe_client
    
    def get_client(self):
        """Get or create a TranscribeStreamingClient."""
        if self.client is None:
            self.client = self._get_transcribe_client()
        return self.client
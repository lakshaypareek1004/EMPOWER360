import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function ChallengeRedirect() {
  const { id } = useParams();
  const nav = useNavigate();
  useEffect(() => {
    if (id) nav(`/challenges/${id}/work`, { replace: true });
  }, [id, nav]);
  return null;
}

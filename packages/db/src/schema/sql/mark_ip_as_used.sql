-- 1. Create the trigger function
CREATE OR REPLACE FUNCTION public.mark_ip_as_used()
RETURNS TRIGGER AS $$
BEGIN
    -- Free the old IP if it was set and is different from the new one
    IF TG_OP = 'UPDATE' AND OLD.ip_address IS NOT NULL AND OLD.ip_address <> NEW.ip_address THEN
        UPDATE public.ip_address
        SET is_used = FALSE
        WHERE ip = OLD.ip_address;
    END IF;

    -- Mark the new IP as used if it is not null
    IF NEW.ip_address IS NOT NULL THEN
        UPDATE public.ip_address
        SET is_used = TRUE
        WHERE ip = NEW.ip_address;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Attach the trigger to public.instance table
CREATE TRIGGER trg_mark_ip_as_used
AFTER INSERT OR UPDATE OF ip_address ON public.instance
FOR EACH ROW
EXECUTE FUNCTION public.mark_ip_as_used();
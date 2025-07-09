// ... existing imports ...

export function CouponForm({ coupon }: CouponFormProps) {
  // ... existing state ...

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setIsLoadingUsers(true);
        const response = await fetch('/api/admin/fetch-users');
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        const { data } = await response.json();
        setUsers(data || []);
      } catch (error) {
        console.error("Error loading users:", error);
        toast.error("Failed to load users");
      } finally {
        setIsLoadingUsers(false);
      }
    };

    if (isOpen) {
      loadUsers();
    }
  }, [isOpen]);

  // ... rest of the component ...
}